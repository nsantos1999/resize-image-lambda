const aws = require("aws-sdk");

const s3 = new aws.S3({ apiVersion: "2006-03-01" });

async function getContentFile(bucket, key) {
  const params = {
    Bucket: bucket,
    Key: key,
  };

  try {
    const { ContentType } = await s3.getObject(params).promise();
    console.log("CONTENT TYPE:", ContentType);
    return ContentType;
  } catch (err) {
    console.log(err);
    const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
    console.log(message);
    throw new Error(message);
  }
}

async function uploadFile(bucket, key, body) {
  const params = {
    Bucket: bucket,
    Key: `resized/${key}`,
    Body: body,
  };

  try {
    await s3.upload(params).promise();
  } catch (err) {
    throw new Error("We have a problem to upload file");
  }
}

exports.handler = async (event) => {
  // TODO implement

  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, " ")
  );

  const imageUploaded = await getContentFile(bucket, key);

  try {
    await uploadFile(bucket, `resized/${key}`, imageUploaded);

    const response = {
      statusCode: 200,
      body: JSON.stringify({ message: "Image resized" }),
    };

    return response;
  } catch (err) {
    const response = {
      statusCode: 500,
      body: JSON.stringify({ message: "Resize problem" }),
    };

    return response;
  }

  // const response = {
  //   statusCode: 200,
  //   body: JSON.stringify("Hello world lamba CD"),
  // };
  // return response;
};
