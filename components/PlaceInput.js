import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import Axios from 'axios';
import debounce from 'lodash/debounce';

const PlaceInput = ({userLatitude, userLongitude, showDirectionsOnMap}) => {
  const [predictions, setPredictions] = useState([]);
  const [destinationInput, setDestinationInput] = useState('');

  const getPlaces = async input => {
    try {
      const response = await Axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${YOUR_API_KEY}&input=${input}&location=${userLatitude},${userLongitude}&radius=2000`,
      );
      setPredictions(response.data.predictions);
    } catch (error) {}
  };

  const getPlacesDebounced = debounce(getPlaces, 1000);

  const setDestination = (main_text, place_id) => {
    Keyboard.dismiss();
    setDestinationInput(main_text);
    setPredictions([]);
    showDirectionsOnMap(place_id);
  };

  const renderPredictions = predictions.map(prediction => {
    const {
      id,
      structured_formatting: {main_text, secondary_text},
      place_id,
    } = prediction;
    return (
      <TouchableOpacity
        key={id}
        onPress={() => setDestination(main_text, place_id)}>
        <View style={styles.suggestionStyle}>
          <Text style={styles.main_textStyle}>{main_text}</Text>
          <Text style={styles.secondary_textStyle}>{secondary_text}</Text>
        </View>
      </TouchableOpacity>
    );
  });

  return (
    <View>
      <TextInput
        value={destinationInput}
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={input => {
          setDestinationInput(input);
          getPlacesDebounced(input);
        }}
        style={styles.placeInputStyle}
        placeholder="Where to?"
      />
      {renderPredictions}
    </View>
  );
};

const styles = StyleSheet.create({
  placeInputStyle: {
    height: 40,
    marginTop: 50,
    padding: 5,
    backgroundColor: 'white',
  },
  secondary_textStyle: {
    color: '#777',
  },
  main_textStyle: {
    color: '#000',
  },
  suggestionStyle: {
    borderTopWidth: 0.5,
    backgroundColor: 'white',
    borderColor: '#777',
    padding: 15,
  },
});

export default PlaceInput;
