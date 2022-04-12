const handler = async (event: any, context: any) => {
  console.log("handler in the imported function");
  const statusCode = 200;
  const headers = {
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Origin": String(process.env.ALLOWED_ORIGIN),
    "Access-Control-Allow-Methods": "*",
  };

  return {
    statusCode,
    headers,
  };
};

export default handler;
