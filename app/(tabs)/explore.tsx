import React, { useState } from 'react';
import { Button, Image, View, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

export default function App() {
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [imageLocation, setImageLocation] = useState<string | null>(null);

  const pickImage = async () => {
    // Request permission to access the media library
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert('Permission to access camera roll is required!');
      return;
    }

    // Launch the image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled && result.assets) {
      const imageAsset = result.assets[0];
      setSelectedImageUri(imageAsset.uri);

      try {
        // Save the image to the media library to get the asset ID
        const savedAsset = await MediaLibrary.createAssetAsync(imageAsset.uri);
        // Get the asset details from the media library
        const asset = await MediaLibrary.getAssetInfoAsync(savedAsset.id);
        console.log(asset.exif)
        if (asset.location) {
          const { latitude, longitude } = asset.location;
          console.log('Image Location:', `Latitude: ${latitude}, Longitude: ${longitude}`);
          setImageLocation(`Latitude: ${latitude}, Longitude: ${longitude}`);
        } else {
          console.log('No location data available for this image.');
          setImageLocation('No location data available.');
        }
      } catch (error) {
        console.error('Error fetching image location:', error);
      }
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Pick an image from gallery" onPress={pickImage} />

      {selectedImageUri && (
        <>
          <Image source={{ uri: selectedImageUri }} style={{ width: 200, height: 200, marginTop: 20 }} />
          {imageLocation && <Text style={{ marginTop: 10 }}>{imageLocation}</Text>}
        </>
      )}
    </View>
  );
}
