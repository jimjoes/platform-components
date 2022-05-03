import { useState, useCallback } from "react";
import { getQueryStringValue, setQueryStringValue } from "./queryStringUtils";

type IProps = {
  key: string;
  initialValue?: string;
};

const useQueryString = ({ key, initialValue = "" }: IProps) => {
  const keyValue: string = getQueryStringValue(key) || initialValue;
  const [value, setValue] = useState<string>(keyValue);
  const onSetValue = useCallback(
    (newValue) => {
      setValue(newValue);
      setQueryStringValue(key, newValue);
    },
    [key]
  );

  return [String(value), onSetValue];
};

export default useQueryString;
