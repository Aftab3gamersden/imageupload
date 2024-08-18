import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Image, ScrollView, Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [assetInfo, setAssetInfo] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access media library was denied');
      }
    })();
  }, []);

  const pickImageForIOS = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        exif: true, // To include location data
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedImage = result.assets[0];
        setImage(pickedImage.uri);

        if (pickedImage.exif && pickedImage.exif.GPSLatitude && pickedImage.exif.GPSLongitude) {
          setLocation(`Latitude: ${pickedImage.exif.GPSLatitude}, Longitude: ${pickedImage.exif.GPSLongitude}`);
        } else {
          setErrorMsg('No location data found in image');
        }
      } else {
        setErrorMsg('No image was selected');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setErrorMsg(`Error picking image: ${error.message}`);
    }
  };
  const pickImageForAndroid = async () => {
    try {
      let assets = await MediaLibrary.getAssetsAsync({
        first: 1,
        mediaType: MediaLibrary.MediaType.photo,
        sortBy: [['creationTime', false]]
      });

      
      if (assets.assets.length > 0) {
        const asset = assets.assets[0];
        setImage(asset.uri);
        
        const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
        setAssetInfo(JSON.stringify(assetInfo, null, 2));
        
        if (assetInfo.location) {
          setLocation(`Latitude: ${assetInfo.location.latitude}, Longitude: ${assetInfo.location.longitude}`);
        } else {
          setErrorMsg('No location data found in image');
        }
      } else {
        setErrorMsg('No images found in media library');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setErrorMsg(`Error picking image: ${error.message}`);
    }
  };

  const pickImage = Platform.OS === 'ios' ? pickImageForIOS : pickImageForAndroid;
  
  console.log(location);
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button title="Pick an image" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      {location && <Text style={styles.text}>Location: {location}</Text>}
      {errorMsg && <Text style={styles.errorText}>Error: {errorMsg}</Text>}
      {assetInfo && (
        <View style={styles.assetInfoContainer}>
          <Text style={styles.assetInfoTitle}>Asset Info:</Text>
          <Text style={styles.assetInfoText}>{assetInfo}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
  },
  text: {
    marginTop: 20,
    color:"#fff"
  },
  errorText: {
    marginTop: 20,
    color: 'red',
  },
  assetInfoContainer: {
    marginTop: 20,
    width: '100%',
  },
  assetInfoTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  assetInfoText: {
    fontSize: 12,
  },
});
