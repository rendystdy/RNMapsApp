import React, {forwardRef} from 'react';
import {StyleSheet} from 'react-native';
import MapView from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps

const MapScreen = (props, ref) => {
  const {userLatitude, userLongitude} = props;
  return (
    <MapView
      showsUserLocation
      followsUserLocation
      // provider={PROVIDER_GOOGLE} // remove if not using Google Maps
      style={styles.map}
      region={{
        latitude: userLatitude,
        longitude: userLongitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      }}>
      {props.children}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default forwardRef((props, ref) => (
  <MapScreen innerRef={ref} {...props} />
));
