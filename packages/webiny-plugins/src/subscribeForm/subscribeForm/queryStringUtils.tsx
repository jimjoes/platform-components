import qs from "query-string";

const setQueryStringWithoutPageReload = (qsValue: any) => {
  const newurl =
    window.location.protocol +
    "//" +
    window.location.host +
    window.location.pathname +
    qsValue;

  window.history.pushState({ path: newurl }, "", newurl);
};

export const setQueryStringValue = (
  key: any,
  value: any,
  queryString = window.location.search
) => {
  const values = qs.parse(queryString);
  const newQsValue = qs.stringify({ ...values, [key]: value });
  setQueryStringWithoutPageReload(`?${newQsValue}`);
};

export const getQueryStringValue = (
  key: any,
  queryString = window.location.search
) => {
  const values = qs.parse(queryString);
  return String(values[key]);
};
