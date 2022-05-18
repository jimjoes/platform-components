import React from "react";
import { css } from "emotion";

import { PbRenderElementPlugin } from "@webiny/app-page-builder/types";
import { ElementRoot } from "@webiny/app-page-builder/render/components/ElementRoot";

import SubscribeFormRenderer from "./components/subscribeFormRenderer";

const outerWrapper = css({
  boxSizing: "border-box",
});

export default () =>
  ({
    name: "pb-render-page-element-subscribe-form",
    type: "pb-render-page-element",
    elementType: "subscribe-form",
    render({ element }) {
      return (
        <ElementRoot
          className={
            "webiny-pb-base-page-element-style webiny-pb-page-element-embed-iframe " +
            outerWrapper
          }
          element={element}
        >
          <SubscribeFormRenderer element={element} />
        </ElementRoot>
      );
    },
  } as PbRenderElementPlugin);
