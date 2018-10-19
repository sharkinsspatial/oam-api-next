export const mapCentroids = (items) => {
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
  featureCollection.features = items.map((item) => {
    console.log(item.centroid);
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
