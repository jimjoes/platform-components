import React from "react";
import { PbRenderElementPlugin } from "@webiny/app-page-builder/types";

import SubscribeFormRenderer from "./components/subscribeFormRenderer";

export default () =>
  ({
    name: "pb-render-page-element-subscribe-form",
    type: "pb-render-page-element",
    elementType: "subscribe-form",
    render({ element }) {
      return <SubscribeFormRenderer element={element} />;
    },
  } as PbRenderElementPlugin);
