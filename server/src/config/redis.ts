import { createClient, RedisClientType } from 'redis';
import colors from "colors"
import { getKeys } from './keys.js';

let client: RedisClientType;

export const connectRedis = async () => {
    const keys = await getKeys(); 

    const port =  13681;

    client = createClient({
        username: 'default',
        password: keys.redisPassword,
        socket: {
            host: keys.redisHost,
            port
        }
    });

	client.on("error", (err: Error) => {
		console.error("Redis Client Error", err);
	});

	await client.connect();

	console.log(colors.red.bold(`Redis connected to host: ${keys.redisHost}:${port}`));
};

export const getRedisClient = () => client;
