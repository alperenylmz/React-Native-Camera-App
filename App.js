// React Native Camera

// import React in our code
import React, {useState, useRef} from 'react';

// import all the components we are going to use
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableHighlight,
  TouchableOpacity,
  Platform,
  Button,
  Image
} from 'react-native';

// import CameraScreen
//import {CameraScreen} from 'react-native-camera-kit';
import {Camera, CameraType} from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { TextRecognition } from 'react-native-text-recognition';
import { shareAsync } from 'expo-sharing';
//import TextRecognition from '@react-native-ml-kit/text-recognition';

const App = () => {
  const [isPermitted, setIsPermitted] = useState(false);
  const [captureImages, setCaptureImages] = useState([]);
  const [type, setType] = useState(CameraType.back);
  const [image, setImage] = useState(null);
  const [text, setText] = useState(null);
  const cameraRef = useRef();

  const requestPermission = async () => {
    if(Platform.OS !== 'web'){
      const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if(status !== 'granted'){
       return false
      }
      return true
    }
  }

  let takePic = async () => {
    let options = {
      quality: 1,
      base64: true,
      exif: false
    };
    let newPhoto = await cameraRef.current.takePictureAsync(options);
    setImage(newPhoto);
  };

  let savePhoto = () => {
    MediaLibrary.saveToLibraryAsync(image.uri).then(() => {
      setImage(undefined);
    });
  };

  let sharePic = () => {
    shareAsync(image.uri).then(() => {
      setImage(undefined);
    })
  }
  
  const pickImage = async () => {
    const hasPermission = await requestPermission();

    if(hasPermission) {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4,3],
        quality: 1
      })

      if(result){
        (async () => {
          const textRec = await TextRecognition.recognizeText({image:result});
          console.log(result);
          console.log(textRec);
          setText(textRec);          
        })
      }

      if(!result.canceled){
        setImage(result.assets[0].uri)
      }
    }
    else if(!hasPermission){
      alert('Permission needed...')
    }
  }

  const openCamera = async () => {
    const cameraStatus = await Camera.requestCameraPermissionsAsync();
    setIsPermitted(cameraStatus.status === 'granted');
  };

  let toggleCameraType = () => {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }

  return (
    <SafeAreaView style={{flex: 1}}>
      {isPermitted ? (
        <View style={{flex: 1}}>
          {!image ?
          <Camera style = {styles.camera} ref={cameraRef} type={type}>
            <View>
              <Button title='flip camera' onPress={toggleCameraType}/>
              <Button title='Take a picture' onPress={takePic}/>
            </View>
          </Camera>
          :
          <SafeAreaView style={styles.container}>
            <Image style={styles.preview} source={{uri: "data:image/jpg;base64," + image.base64}}/>
            <Button title="Save" onPress={savePhoto}/>
            <Button title="Share" onPress={sharePic}/>
          </SafeAreaView>
          }
        </View>
      ) : (
        <View style={styles.container}>
          <Text style={styles.titleText}>Camera App</Text>
          <Text style={styles.textStyle}>{captureImages}</Text>
          <TouchableHighlight
            onPress={openCamera}
            style={styles.buttonStyle}
          >
            <Text style={styles.buttonTextStyle}>Open Camera</Text>
          </TouchableHighlight>
          <Button title="Choose Image" onPress={pickImage}/>
          {image && <Image source={{uri:image}} style={{
            width:100,
            height:100,
            top:200,
          }}/>}
          <Text>{text}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 22,
    textAlign: 'center',
    fontWeight: 'bold',
    top: 80
  },
  textStyle: {
    color: 'black',
    fontSize: 16,
    textAlign: 'center',
    padding: 10,
    marginTop: 16,
  },
  buttonStyle: {
    fontSize: 16,
    color: 'white',
    backgroundColor: 'green',
    padding: 5,
    marginTop: 32,
    minWidth: 250,
    top: 95
  },
  buttonTextStyle: {
    padding: 5,
    color: 'white',
    textAlign: 'center',
  },
  camera: {
    flex: 1,
  },

  flipButton: {
    padding: 2,
    color: 'white',
    backgroundColor: 'red',
    marginTop: 20,
    fontSize: 16,
    minWidth: 100,
  },

  takePicButton: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },

  preview: {
    alignSelf: 'stretch',
    flex: 1
  }
});