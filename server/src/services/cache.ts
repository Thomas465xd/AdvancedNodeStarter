import mongoose from "mongoose";
import "../types/mongoose.js";
import { getRedisClient } from "../config/redis.js";

const exec = mongoose.Query.prototype.exec; 

// Define new .cache function that can be appended to any mongoose query function
// to decide wether to cache or not the query. 
// e.g. const user = await User.findById(id).cache()
mongoose.Query.prototype.cache = function (options : { key?: string } = {}) {
    this.useCache = true; 
    this.hashKey = JSON.stringify(options.key || ""); // Top level key
    return this; 
}

mongoose.Query.prototype.exec = async function (...args: []) {
    if(!this.useCache) {
        return exec.apply(this, args);
    }

    //! Retrieve redis client inside function to ensure redis is connected.
    const client = getRedisClient();

    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.model.modelName
    }));

    // console.log(key) // e.g. {"_id":"69b713c85bc360bbf1149283","collection":"User"}

    //? See if we have a value for "key" in redis
    const cacheValue = await client.HGET(this.hashKey, key); 

    //? If we do, return cached value
    if(cacheValue) {
        console.log("Serving from Cache: " + cacheValue); 
        // Since redis returns JSON, but mongoose.exec function expects
        // to return a mongoose document, we also need to transform parsed cacheValue
        // into this mongoose document.
        const docs = JSON.parse(cacheValue); 

        // Little gotcha here, if cached value is an array, then we need to manually
        // hydrate mongoose documents specific properties to each one of the docs, 
        // and  if not, we can just create a new mongoose document on docs.
        return Array.isArray(docs) 
            ? docs.map(doc => new this.model(doc))
            : new this.model(docs); 
    }

    //? Otherwise, issue the query and store the result in redis
    const result = await exec.apply(this, args); 

    /** console.log(result); /** e.g.  
    *    [
    *        {
    *            _id: new ObjectId('69b71c17e07a3496b7141f42'),
    *            title: 'My Blog',
    *            content: 'The great gatsby',
    *            _user: new ObjectId('69b713c85bc360bbf1149283'),
    *            createdAt: 2026-03-15T20:52:39.484Z,
    *            updatedAt: 2026-03-15T20:52:39.484Z,
    *            __v: 0
    *        }
    *    ]
    */

    //? Store result data in redis
    client.HSETEX(this.hashKey, { [key]: JSON.stringify(result) }, { expiration: { type: "EX", value: 10 } }); 

    //! Be careful with what we return
    // Returned value should match the default mongoose .exec 
    // return value. 
    return result
}

export function clearHash(hashKey: string) {
    //! Only works if function is called after redis connection
    const client = getRedisClient();

    client.DEL(JSON.stringify(hashKey)); 
}