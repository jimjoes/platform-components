const handler = async (event: any, context: any) => {
  console.log("event: ", event);

  const statusCode = 200;
  const headers = {
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
  };

  return {
    statusCode,
    headers,
  };
};

export default handler;
