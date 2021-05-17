const aws = require("aws-sdk");
const resizeImg = require("resize-img");

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
    ACL: "public-read",
  };

  try {
    await s3.upload(params).promise();
  } catch (err) {
    throw new Error("We have a problem to upload file");
  }
}

async function resizeImage(imageContent) {
  const image = await resizeImg(imageContent, {
    width: 128,
    height: 128,
  });

  return image;
}

exports.handler = async (event) => {
  // TODO implement
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, " ")
  );

  try {
    console.log("getContentFile...");
    const imageUploaded = await getContentFile(bucket, key);

    console.log("resizeImage...");
    const imageResized = await resizeImage(imageUploaded);

    console.log("uploadFile...");
    await uploadFile(bucket, `resized/${key}`, imageResized);

    console.log("Finishing...");
    const response = {
      statusCode: 200,
      body: JSON.stringify({ message: "Image resized" }),
    };

    return response;
  } catch (err) {
    console.error(err);
    const response = {
      statusCode: 500,
      body: JSON.stringify({ message: "Resize problem" }),
    };

    return response;
  }
};
