export const objectFromURI = (uriDecoded: string) => {
  return JSON.parse(
    '{"' +
    uriDecoded
      .replace(/"/g, '\\"')
      .replace(/&/g, '","')
      .replace(/[=]/g, '":"') +
    '"}',
  );
}

export const timeout = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}
