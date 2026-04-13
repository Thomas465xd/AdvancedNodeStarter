import { createClient, RedisClientType } from 'redis';
import colors from "colors"
import { getKeys } from './keys';

let client: RedisClientType;

export const connectRedis = async () => {
    const keys = await getKeys(); 

    client = createClient({
        username: 'default',
        password: keys.redisPassword,
        socket: {
            host: keys.redisHost,
            port: Number(keys.redisPort) || 6379
        }
    });

	client.on("error", (err: Error) => {
		console.error("Redis Client Error", err);
	});

	await client.connect();

	console.log(colors.red.bold(`Redis connected to host: ${keys.redisHost}:${keys.redisPort}`));
};

export const getRedisClient = () => client;
