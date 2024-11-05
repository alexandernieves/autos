import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styled from 'styled-components/native';
import { LineChart } from 'react-native-chart-kit';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import colors from '../colors';

const screenWidth = Dimensions.get('window').width;

const Admin: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    totalReferrals: 0,
    activeUsers: 0,
    inactiveUsers: 0,
  });

  const fetchData = async (endpoint: string, stateKey: keyof typeof userStats) => {
    try {
      const response = await fetch(`https://api.cabreraapp.alexcode.org/cabrera/${endpoint}`);
      const data = await response.json();
      if (response.ok) {
        setUserStats(prevState => ({
          ...prevState,
          [stateKey]: data[stateKey],
        }));
      } else {
        Alert.alert('Error', `No se pudo obtener el número de ${stateKey}.`);
      }
    } catch (error) {
      console.error(`Error fetching ${stateKey}:`, error);
      Alert.alert('Error', `Error al obtener el número de ${stateKey}.`);
    }
  };

  useEffect(() => {
    fetchData('users/count', 'totalUsers');
    fetchData('referral/count', 'totalReferrals');
    fetchData('users/active/count', 'activeUsers');
    fetchData('users/inactive/count', 'inactiveUsers');
  }, []);

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [50, 45, 28, 80, 99, 43],
        color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
      },
    ],
  };

  return (
    <Container>
      <Header>
        <HeaderText>Admin Dashboard</HeaderText>
      </Header>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <TitleSection>
          <Title>Welcome, Admin!</Title>
          <Description>
            This is your admin dashboard where you can manage users, referrals, and more.
          </Description>
        </TitleSection>

        <Grid>
          <Card onPress={() => navigation.navigate('UserTable')}>
            <CardTitle>Total Users</CardTitle>
            <CardNumber>{userStats.totalUsers}</CardNumber>
          </Card>
          <Card onPress={() => navigation.navigate('ReferralTable')}>
            <CardTitle>Total Referrals</CardTitle>
            <CardNumber>{userStats.totalReferrals}</CardNumber>
          </Card>
        </Grid>

        <Grid>
          <Card>
            <CardTitle>Active Users</CardTitle>
            <CardNumber>{userStats.activeUsers}</CardNumber>
          </Card>
          <Card>
            <CardTitle>Inactive Users</CardTitle>
            <CardNumber>{userStats.inactiveUsers}</CardNumber>
          </Card>
        </Grid>

        <ChartSection>
          <LineChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            yAxisSuffix="k"
            chartConfig={{
              backgroundColor: colors.primary,
              backgroundGradientFrom: colors.primary,
              backgroundGradientTo: colors.primary,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </ChartSection>

        <LogoutButton onPress={() => navigation.navigate('Login')}>
          <Ionicons name="log-out-outline" size={24} color="#FFF" />
          <LogoutText>Log Out</LogoutText>
        </LogoutButton>
      </ScrollView>
    </Container>
  );
};

export default Admin;

// Estilos personalizados
const Container = styled.View`
  flex: 1;
  background-color: #f5f5f5;
`;

const Header = styled.View`
  width: 100%;
  background-color: ${colors.primary};
  padding-top: 60px;
  padding-bottom: 20px;
  align-items: center;
  justify-content: center;
`;

const HeaderText = styled.Text`
  color: #fff;
  font-size: 24px;
  font-weight: bold;
`;

const TitleSection = styled.View`
  margin-bottom: 20px;
  text-align: center;
`;

const Title = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: ${colors.primary};
`;

const Description = styled.Text`
  font-size: 16px;
  color: #555;
  text-align: center;
`;

const Grid = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Card = styled.TouchableOpacity`
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  flex: 1;
  margin: 0 10px;
  align-items: center;
  justify-content: center;
  elevation: 3;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 10px;
`;

const CardTitle = styled.Text`
  font-size: 16px;
  color: #555;
  margin-bottom: 10px;
`;

const CardNumber = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: ${colors.primary};
`;

const ChartSection = styled.View`
  margin-bottom: 30px;
`;

const LogoutButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${colors.primary};
  padding: 15px;
  width: 80%;
  border-radius: 10px;
  align-self: center;
  margin-top: 20px;
`;

const LogoutText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: bold;
  margin-left: 10px;
`;
