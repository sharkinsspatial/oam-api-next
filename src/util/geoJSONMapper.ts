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

const mapCentroids = (items) => {
  featureCollection.features = items.map((item) => {
    const { id } = item;
    return {
      id,
      type: 'Feature',
      geometry: item.centroid,
      properties: {
        id
      }
    };
  });

  return featureCollection;
};

const mapItems = (items, host) => {
  featureCollection.features = items.map((item) => {
    const {
      id,
      geom,
      thumbnail,
      href,
      title,
      provider,
      license,
      datetime,
      startDatetime,
      endDatetime,
      platform,
      instrument,
      gsd,
      keywords,
      user
    } = item;

    const {
      id: userId = '',
      name: userName = ''
    } = user || {};

    return {
      id,
      type: 'Feature',
      geometry: geom,
      links: [{
        rel: 'self',
        href: `http://${host}/items/${id}`
      }],
      assets: {
        thumbnail: {
          href: thumbnail
        },
        primary: {
          href
        }
      },
      properties: {
        id,
        datetime,
        title,
        keywords,
        'item:providers': [{
          name: provider
        }],
        'item:license': license,
        'dtr:start_datetime': startDatetime,
        'dtr:end_datetime': endDatetime,
        'eo:gsd': gsd,
        'eo:platform': platform,
        'eo:instrument': instrument,
        'oam:uploaderid': userId,
        'oam:uploadername': userName
      }
    };
  });

  return featureCollection;
};

export { mapCentroids, mapItems };
