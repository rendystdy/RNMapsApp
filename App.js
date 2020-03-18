import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  Platform,
  PermissionsAndroid,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import Axios from 'axios';
import polyline from '@mapbox/polyline';
import MapView, {Polyline, Marker} from 'react-native-maps';

import PlaceInput from './components/PlaceInput';

let geolocationWacthId = null;

const App = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [userLatitude, setUserLatitude] = useState(0);
  const [userLongitude, setUserLongitude] = useState(0);
  const [destinationCoords, setDestinationCoords] = useState([]);
  const map = useRef();

  useEffect(() => {
    requestFineLocation();
    return () => {
      Geolocation.clearWatch(geolocationWacthId);
    };
  }, [requestFineLocation, getLocation]);

  const showDirectionsOnMap = async place_id => {
    try {
      const response = await Axios.get(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${userLatitude},${userLongitude}&destination=place_id:${place_id}&key=${YOUR_API_KEY}`,
      );
      const points = polyline.decode(
        response.data.routes[0].overview_polyline.points,
      );

      const latlang = points.map(point => ({
        latitude: point[0],
        longitude: point[1],
      }));

      setDestinationCoords(latlang);
      map.current.fitToCoordinates(latlang, {
        edgePadding: {top: 40, bottom: 40, left: 40, right: 40},
      });
    } catch (error) {}
  };

  const getLocation = useCallback(() => {
    setHasPermission(true);
    geolocationWacthId = Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;

        setUserLatitude(latitude);
        setUserLongitude(longitude);
      },
      error => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
    return geolocationWacthId;
  }, []);

  const requestFineLocation = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getLocation();
        }
      } else {
        getLocation();
      }
    } catch (err) {
      console.warn(err);
    }
  }, [getLocation]);

  const hideKeyboard = () => {
    Keyboard.dismiss();
  };

  if (hasPermission) {
    let polylineComp = null;
    let marker = null;
    if (destinationCoords.length > 0) {
      polylineComp = (
        <Polyline
          coordinates={destinationCoords}
          strokeWidth={4}
          strokeColor="#000"
        />
      );
      marker = (
        <Marker coordinate={destinationCoords[destinationCoords.length - 1]} />
      );
    }

    return (
      <TouchableWithoutFeedback onPress={hideKeyboard}>
        <View style={styles.container}>
          <MapView
            ref={map}
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
            {polylineComp}
            {marker}
          </MapView>
          <PlaceInput
            showDirectionsOnMap={showDirectionsOnMap}
            userLatitude={userLatitude}
            userLongitude={userLongitude}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  } else {
    return null;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default App;
