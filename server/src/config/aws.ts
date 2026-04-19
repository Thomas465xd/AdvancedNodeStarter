import AWS from "aws-sdk";
import { getKeys } from "./keys";
import colors from "colors";

const keys = await getKeys();

export const s3 = new AWS.S3({
	credentials: {
		accessKeyId: keys.awsAccessId,
		secretAccessKey: keys.awsAccessSecret,
	},
	region: "us-east-1",
});

export async function testS3Connection() {
	try {
		const data = await s3.listBuckets().promise();
		console.log(colors.yellow.bold(`S3 Instance Connected Successfully! Buckets: ${JSON.stringify(data.Buckets)}`));
	} catch (error) {
        console.log(colors.red.bold(`Error connecting to AWS S3: ${error}`)); 
	}
}
