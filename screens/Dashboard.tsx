import React, { useState, useEffect } from "react";
import { ScrollView, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import styled from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import colors from '../colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const Dashboard: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [pendingReferrals, setPendingReferrals] = useState(0);
  const [bookedReferrals, setBookedReferrals] = useState(0);
  const [closedReferrals, setClosedReferrals] = useState(0);
  const [lostReferrals, setLostReferrals] = useState(0);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const fetchBalance = async () => {
    try {
      setLoadingBalance(true);
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        Alert.alert('Error', 'No se encontró un token, por favor inicie sesión.');
        return;
      }

      const response = await fetch('https://api.cabreraapp.alexcode.org/cabrera/user/balance', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setBalance(Number(data.balance));
      } else {
        if (data.message === "jwt expired") {
          Alert.alert('Error', 'La sesión ha expirado, por favor inicie sesión nuevamente.');
        } else {
          Alert.alert('Error', data.message || 'Error al obtener el saldo.');
        }
      }
    } catch (error) {
      console.error('Error al obtener el saldo:', error);
      Alert.alert('Error', 'Error al obtener el saldo.');
    } finally {
      setLoadingBalance(false);
    }
  };

  const fetchData = async (url: string, setState: React.Dispatch<React.SetStateAction<number>>, label: string) => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        Alert.alert('Error', 'No se encontró un token, por favor inicie sesión.');
        return;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setState(data[label]);
      } else if (data.message === "jwt expired") {
        Alert.alert('Error', 'La sesión ha expirado, por favor inicie sesión nuevamente.');
      } else {
        Alert.alert('Error', data.message || `Error al obtener los referidos de ${label}.`);
      }
    } catch (error) {
      console.error(`Error fetching ${label} referrals:`, error);
      Alert.alert('Error', `Error al obtener los referidos de ${label}.`);
    }
  };

  const fetchAllData = async () => {
    await fetchData('https://api.cabreraapp.alexcode.org/cabrera/referrals/count', setTotalReferrals, 'totalReferrals');
    await fetchData('https://api.cabreraapp.alexcode.org/cabrera/referrals/count-pending', setPendingReferrals, 'pendingReferrals');
    await fetchData('https://api.cabreraapp.alexcode.org/cabrera/referrals/count-booked', setBookedReferrals, 'bookedReferrals');
    await fetchData('https://api.cabreraapp.alexcode.org/cabrera/referrals/count-closed', setClosedReferrals, 'closedReferrals');
    await fetchData('https://api.cabreraapp.alexcode.org/cabrera/referrals/count-lost', setLostReferrals, 'lostReferrals');
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
    fetchBalance();
  }, []);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <ReferralContainer>
        <ReferralBoxLarge>
          <BoxTitle>{t('Total_Referrals')}</BoxTitle>
          <BoxIconAndValue>
            <FontAwesome name="users" size={50} color={colors.primary} />
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <BoxValue>{totalReferrals}</BoxValue>
            )}
          </BoxIconAndValue>
        </ReferralBoxLarge>

        <RowContainer>
          <ReferralBoxSquare>
            <SmallBoxTitle>{t('Pending')}</SmallBoxTitle>
            <BoxIconAndValue>
              <FontAwesome name="hourglass-half" size={50} color={colors.primary} />
              {loading ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : (
                <SmallBoxValue>{pendingReferrals}</SmallBoxValue>
              )}
            </BoxIconAndValue>
          </ReferralBoxSquare>

          <ReferralBoxSquare>
            <SmallBoxTitle>{t('Booked')}</SmallBoxTitle>
            <BoxIconAndValue>
              <FontAwesome name="check-circle" size={50} color={colors.primary} />
              {loading ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : (
                <SmallBoxValue>{bookedReferrals}</SmallBoxValue>
              )}
            </BoxIconAndValue>
          </ReferralBoxSquare>
        </RowContainer>

        <RowContainer>
          <ReferralBoxSquare>
            <SmallBoxTitle>{t('Sold')}</SmallBoxTitle>
            <BoxIconAndValue>
              <FontAwesome name="smile-o" size={50} color={colors.primary} />
              {loading ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : (
                <SmallBoxValue>{closedReferrals}</SmallBoxValue>
              )}
            </BoxIconAndValue>
          </ReferralBoxSquare>

          <ReferralBoxSquare>
            <SmallBoxTitle>{t('Lost')}</SmallBoxTitle>
            <BoxIconAndValue>
              <FontAwesome name="frown-o" size={50} color={colors.primary} />
              {loading ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : (
                <SmallBoxValue>{lostReferrals}</SmallBoxValue>
              )}
            </BoxIconAndValue>
          </ReferralBoxSquare>
        </RowContainer>

        <CardContainer>
          <LinearGradient
            colors={['#1f1f1f', '#2a2a2a']}
            style={{
              borderRadius: 15,
              padding: 20,
            }}
          >
            <CardTitle>CABRERA</CardTitle>
            <CardSubtitle>{t('CARD')}</CardSubtitle>
            <BalanceContainer>
              <BalanceText>
                {loadingBalance ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  `$${balance.toFixed(2)}`
                )}
              </BalanceText>
              <TouchableOpacity onPress={fetchBalance}>
                <FontAwesome name="refresh" size={20} color="#FFF" style={{ marginLeft: 10 }} />
              </TouchableOpacity>
            </BalanceContainer>
            <WithdrawButton>
              <WithdrawButtonText>{t('withdraw_profit')}</WithdrawButtonText>
            </WithdrawButton>
          </LinearGradient>
        </CardContainer>
        <BottomMargin />
      </ReferralContainer>
    </ScrollView>
  );
};

export default Dashboard;


// Estilos
const ReferralContainer = styled.View`
  padding: 20px;
  flex-grow: 1;
`;

const ReferralBoxLarge = styled.View`
  background-color: #f6f6f6;
  padding: 20px;
  margin-bottom: 30px;
  height: 150px;
  border-radius: 30px;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
`;

const BoxTitle = styled.Text`
  font-size: 18px;
  color: ${colors.primary};
`;

const BoxIconAndValue = styled.View`
  flex-direction: row;
  align-items: center;
`;

const BoxValue = styled.Text`
  font-size: 50px;
  font-weight: bold;
  color: ${colors.primary};
  margin-left: 10px;
`;

const RowContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const ReferralBoxSquare = styled.View`
  flex: 1;
  background-color: #f6f6f6;
  padding: 40px;
  margin: 10px;
  border-radius: 20px;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
`;

const SmallBoxTitle = styled.Text`
  font-size: 18px;
  color: ${colors.primary};
  margin-bottom: 10px;
`;

const SmallBoxValue = styled.Text`
  font-size: 40px;
  font-weight: bold;
  color: ${colors.primary};
  margin-left: 10px;
`;

const CardContainer = styled.View`
  width: 95%;
  margin: 20px auto;
  border-radius: 15px;
  shadow-color: #000;
  shadow-opacity: 0.2;
  shadow-radius: 5px;
  elevation: 4;
`;

const CardTitle = styled.Text`
  color: #ffffff;
  font-size: 30px;
  font-weight: bold;
  position: absolute;
  top: 15px;
  left: 15px;
`;

const CardSubtitle = styled.Text`
  color: #ffffff;
  font-size: 24px;
  font-weight: bold;
  position: absolute;
  top: 50px;
  left: 15px;
`;

const BalanceContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  position: absolute;
  top: 15px;
  right: 15px;
`;

const BalanceText = styled.Text`
  color: #ffffff;
  font-size: 18px;
  font-weight: bold;
`;

const WithdrawButton = styled.TouchableOpacity`
  background-color: #ffffff;
  padding: 10px 15px;
  border-radius: 10px;
  align-items: center;
  margin-top: 100px;
  align-self: flex-end;
`;

const WithdrawButtonText = styled.Text`
  color: #1f1f1f;
  font-size: 14px;
  font-weight: bold;
`;

const BottomMargin = styled.View`
  height: 50px; /* Margen adicional */
`;
