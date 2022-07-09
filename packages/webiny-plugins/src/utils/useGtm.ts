import TagManager from "react-gtm-module";

export const initGTM = (id: string) => {
  if (process.env.NODE_ENV === "production") {
    const args = {
      gtmId: id,
    };
    console.log("GTM init");
    TagManager.initialize(args);
  }
};

export const sendPageView = (path: string, url: string, title: string) => {
  if (process.env.NODE_ENV === "production") {
    console.log("GTM pageview");
    TagManager.dataLayer({
      dataLayer: {
        event: "pageview",
        pagePath: path,
        pageUrl: url,
        pageTitle: title,
      },
    });
  }
};
export const sendEvent = (eventName: string) => {
  if (process.env.NODE_ENV === "production") {
    console.log("GTM event");
    TagManager.dataLayer({
      dataLayer: {
        event: eventName,
      },
    });
  }
};
export const sendUserId = (id: string) => {
  if (process.env.NODE_ENV === "production") {
    console.log("GTM set username");
    TagManager.dataLayer({
      dataLayer: {
        userId: id,
        event: "userIdSet",
      },
    });
  }
};
