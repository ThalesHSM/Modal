import React, {useCallback, useState} from 'react';
import {ActivityIndicator, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';

import {getAuth, signOut} from 'firebase/auth';

import firebaseConfig from '../../config/firebase/firebaseConfig';
import {
  doc,
  getDoc,
  getFirestore,
  initializeFirestore,
} from 'firebase/firestore';
import {initializeApp} from 'firebase/app';

import {
  StyledButtonText,
  StyledGreyText,
  StyledH1Text,
  StyledMainView,
  StyledSignInButton,
} from './StyledHomeScreen';
import {useDispatch, useSelector} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import {changeLoggedIn} from '../../Redux/actions/upgrade-action';
import LoginInput from '../../components/LoginInput/LoginInput';

const app = initializeApp(firebaseConfig);

initializeFirestore(app, {experimentalForceLongPolling: true});

export const db = getFirestore(app);

function HomeScreen({navigation}: any) {
  const [isLoading, setIsLoading] = useState(false);

  const [isUpgradedUser, setIsUpgradedUser] = useState(false);

  const loggedUser = useSelector((state: any) => state.logged.logged);
  const dispatch = useDispatch();

  function Logout() {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        dispatch(changeLoggedIn(''));

        setIsUpgradedUser(false);
      })
      .catch(error => {
        console.log(error);
      });
  }

  useFocusEffect(
    useCallback(() => {
      async function getUpgradedUser() {
        if (loggedUser) {
          const upgradedRef = doc(db, 'users', loggedUser);
          setIsLoading(true);
          const getFirebaseItems = await getDoc(upgradedRef);
          setIsLoading(false);

          if (getFirebaseItems.exists()) {
            setIsUpgradedUser(true);

            return;
          } else {
            return;
          }
        }
      }

      getUpgradedUser();
    }, [loggedUser]),
  );

  return (
    <StyledMainView>
      {loggedUser ? (
        <>
          <StyledH1Text>Configurações</StyledH1Text>
          {isLoading ? (
            <ActivityIndicator size="large" color="#000" />
          ) : (
            <>
              {isUpgradedUser ? (
                <View>
                  <StyledGreyText>Você já é assinante</StyledGreyText>

                  <StyledSignInButton
                    style={{flexDirection: 'row'}}
                    onPress={Logout}>
                    <Icon name="logout" size={28} color="#f075b6" />
                    <StyledButtonText style={{marginLeft: 20}}>
                      Logout
                    </StyledButtonText>
                  </StyledSignInButton>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => navigation.navigate('SignUp')}
                  style={{flexDirection: 'row', marginTop: 30}}>
                  <Icon name="sync" size={28} color="grey" />
                  <StyledGreyText>Faça upgrade agora</StyledGreyText>
                </TouchableOpacity>
              )}
            </>
          )}
        </>
      ) : (
        <>
          <LoginInput setIsLoading={setIsLoading} />
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color="#000"
              style={{marginTop: 20}}
            />
          ) : null}
        </>
      )}
    </StyledMainView>
  );
}

export default HomeScreen;
