import React from "react";
import { css } from "emotion";
import { ElementRoot } from "@webiny/app-page-builder/render/components/ElementRoot";
import { SubscribeForm } from "../../subscribeForm";

const outerWrapper = css({
  boxSizing: "border-box",
});

const SubscribFormRenderer = ({ element }: { element: any }) => {
  const { data } = element;

  // Otherwise, let's render the mailcsubscribehimp form.
  return (
    <ElementRoot
      className={"webiny-pb-base-page-element-style " + outerWrapper}
      element={element}
    >
      <SubscribeForm data={data.subscribeForm} />
    </ElementRoot>
  );
};

export default SubscribFormRenderer;
