export const getImageUrl = url => {
  let splitUrl = url.split("/");
  splitUrl.splice(splitUrl.length - 2, 2, "300", "200");

  return splitUrl.join("/");
};

export const getImageUrl2x = url => {
  let splitUrl = url.split("/");
  splitUrl.splice(splitUrl.length - 2, 2, "600", "400");

  return splitUrl.join("/");
};
