"use client";

import { forwardRef } from "react";
import ReactGlobe from "react-globe.gl";

const GlobeWrapper = forwardRef((props: any, ref) => {
  return <ReactGlobe ref={ref} {...props} />;
});

GlobeWrapper.displayName = "GlobeWrapper";
export default GlobeWrapper;
