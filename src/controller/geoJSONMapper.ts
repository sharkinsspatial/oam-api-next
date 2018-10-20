const featureCollection = {
  crs: {
    properties: {
      name: 'urn:ogc:def:crs:OGC:1.3:CRS84'
    },
    type: 'name'
  },
  features: null,
  type: 'FeatureCollection'
};

export const mapCentroids = (items) => {
  featureCollection.features = items.map((item) => {
    return {
      type: 'Feature',
      id: item.id,
      geometry: item.centroid,
      properties: {
        id: item.id
      }
    };
  });

  return featureCollection;
};

export const mapItems = (items) => {
  featureCollection.features = items.map((item) => {
    return {
      type: 'Feature',
      id: item.id,
      geometry: item.geom,
      properties: {
        id: item.id,
        provider: item.provider,
        href: item.href,
        title: item.title
      }
    };
  });

  return featureCollection;
};
