import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, Alert, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import styled from 'styled-components/native';
import { Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../App'; // Importa tu lista de rutas tipadas

// Styled Components
const Container = styled.View`
  flex: 1;
  padding: 20px;
  background-color: #fff;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-vertical: 20px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #002368;
`;

const FilterContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-vertical: 10px;
  border-bottom-width: 1px;
  border-bottom-color: #ccc;
`;

const FilterText = styled.Text`
  font-size: 16px;
  color: #002368;
`;

const ReferralsList = styled.ScrollView`
  padding-vertical: 20px;
`;

const ReferralCard = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 10px;
  background-color: #f6f7fb;
  border-radius: 10px;
  margin-bottom: 10px;
`;

const NoReferralsText = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #888;
  text-align: center;
  margin-top: 20px;
`;

const AvatarIcon = styled.View`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  margin-right: 15px;
  background-color: #002368; /* Azul de la empresa */
  justify-content: center;
  align-items: center;
`;

const ReferralInfo = styled.View`
  flex-direction: column;
`;

const ReferralName = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #002368;
`;

interface BadgeProps {
  bgColor: string;
  textColor: string;
}

const BadgeContainer = styled.View<BadgeProps>`
  margin-top: 5px;
  padding: 5px 10px;
  border-radius: 20px;
  background-color: ${(props: { bgColor: any; }) => props.bgColor};
  border: 1px solid ${(props: { textColor: any; }) => props.textColor};
`;

const BadgeText = styled.Text<BadgeProps>`
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  color: ${(props: { textColor: any; }) => props.textColor};
`;

const PaginationContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
`;

const PaginationButton = styled.TouchableOpacity`
  padding: 10px;
`;

const PageCircle = styled(Animated.View)<{ isActive: boolean }>`
  margin: 0 5px;
  padding: 10px;
  width: 35px;
  height: 35px;
  border-radius: 50px;
  background-color: ${(props: { isActive: any; }) => (props.isActive ? '#002368' : 'transparent')};
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s ease;
`;

const PageNumber = styled.Text<{ isActive: boolean }>`
  font-size: 16px;
  font-weight: ${(props: { isActive: any; }) => (props.isActive ? 'bold' : 'normal')};
  color: ${(props: { isActive: any; }) => (props.isActive ? '#fff' : '#002368')};
`;

const Footer = styled.View`
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  padding-vertical: 20px;
  border-top-width: 1px;
  border-top-color: #ccc;
`;

const FooterButton = styled.TouchableOpacity`
  align-items: center;
`;

const FooterButtonText = styled.Text`
  color: #002368;
  font-size: 12px;
`;

// Mapeo de colores para los badges
const statusColors: Record<string, { bgColor: string; textColor: string }> = {
  booked: { bgColor: '#E0F2E9', textColor: '#4CAF50' },
  pending: { bgColor: '#FFF8E1', textColor: '#FFC107' },
  closed: { bgColor: '#E3F2FD', textColor: '#2196F3' },
  lost: { bgColor: '#FFEBEE', textColor: '#F44336' },
};

export default function Referrals() {
  const [referralsData, setReferralsData] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('All Referrals');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; // Hasta 5 referidos por página
  const paginationAnimation = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        if (!token) {
          Alert.alert('Error', 'No se encontró un token, por favor inicie sesión.');
          return;
        }
        const response = await fetch('https://api.cabreraapp.alexcode.org/cabrera/user/referrals', {
          headers: { Authorization: `${token}` }, // Agrega el token de autorización
        });

        if (response.ok) {
          const data = await response.json();
          setReferralsData(data.referrals);
        } else {
          const errorData = await response.json();
          Alert.alert('Error', errorData.message);
        }
      } catch (error) {
        console.error('Error fetching referrals:', error);
        Alert.alert('Error', 'Failed to fetch referrals');
      }
    };

    fetchReferrals();
  }, []);

  useEffect(() => {
    Animated.timing(paginationAnimation, {
      toValue: currentPage,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentPage]);

  const filters = ['All Referrals', 'Booked', 'Pending', 'Closed', 'Lost'];

  const applyFilter = (filter: string) => {
    setSelectedFilter(filter);
  };

  const filteredData = referralsData.filter((referral) => {
    if (selectedFilter === 'All Referrals') return true;
    return referral.status === selectedFilter;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Container>
      <Header>
        <Title>Referrals</Title>
        <Ionicons name="filter-outline" size={24} color="#002368" />
      </Header>

      <FilterContainer>
        <FilterText>{selectedFilter}</FilterText>
        <Ionicons name="chevron-down-outline" size={20} color="#002368" />
      </FilterContainer>

      <ReferralsList>
        {currentData.length === 0 ? (
          <NoReferralsText>You don't have referrals yet</NoReferralsText> // Mensaje si no hay referidos
        ) : (
          currentData.map((referral, index) => (
            <ReferralCard key={index}>
              {/* Icono de persona en lugar de imagen */}
              <AvatarIcon>
                <Ionicons name="person-outline" size={30} color="#fff" />
              </AvatarIcon>
              <ReferralInfo>
                <ReferralName>{referral.first_name} {referral.last_name}</ReferralName>
                <BadgeContainer
                  bgColor={statusColors[referral.status?.toLowerCase() || 'pending'].bgColor}
                  textColor={statusColors[referral.status?.toLowerCase() || 'pending'].textColor}
                >
                  <BadgeText
                    bgColor={statusColors[referral.status?.toLowerCase() || 'pending'].bgColor}
                    textColor={statusColors[referral.status?.toLowerCase() || 'pending'].textColor}
                  >
                    {referral.status || 'Pending'}
                  </BadgeText>
                </BadgeContainer>
              </ReferralInfo>
            </ReferralCard>
          ))
        )}
      </ReferralsList>

      {/* Paginación solo se muestra si hay referidos */}
      {filteredData.length > 0 && (
        <PaginationContainer>
          <PaginationButton onPress={handlePreviousPage} disabled={currentPage === 1}>
            <Ionicons name="chevron-back-outline" size={24} color={currentPage === 1 ? '#ccc' : '#002368'} />
          </PaginationButton>

          {[...Array(totalPages)].map((_, index) => (
            <PageCircle key={index} isActive={index + 1 === currentPage}>
              <PageNumber isActive={index + 1 === currentPage}>
                {index + 1}
              </PageNumber>
            </PageCircle>
          ))}

          <PaginationButton onPress={handleNextPage} disabled={currentPage === totalPages}>
            <Ionicons name="chevron-forward-outline" size={24} color={currentPage === totalPages ? '#ccc' : '#002368'} />
          </PaginationButton>
        </PaginationContainer>
      )}

      <Footer>
        <FooterButton onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home-outline" size={28} color="#002368" />
          <FooterButtonText>Home</FooterButtonText>
        </FooterButton>
        <FooterButton>
          <Ionicons name="add-outline" size={28} color="#002368" />
          <FooterButtonText>Add</FooterButtonText>
        </FooterButton>

        <FooterButton>
          <Ionicons name="person-outline" size={28} color="#002368" />
          <FooterButtonText>Profile</FooterButtonText>
        </FooterButton>
      </Footer>
    </Container>
  );
}
