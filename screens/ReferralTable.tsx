import React, { useState, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { NativeBaseProvider, Box, Heading, Button, Modal, HStack, Text, Spinner, Center } from 'native-base';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../App';

// Definir el tipo de los referidos
interface Referral {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  vehicle_status: string;
  vehicle_brand: string;
  vehicle_model: string;
  referred_by_user_id: number;
  status: string;
}

const ReferralTable: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [newStatus, setNewStatus] = useState('Pending');
  const [modalVisible, setModalVisible] = useState(false);
  const itemsPerPage = 5;

  const fetchReferrals = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.cabreraapp.alexcode.org/cabrera/get-referrals?page=${page}&limit=${itemsPerPage}`);
      const data = await response.json();
      setReferrals(data.referrals);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
    } catch (error) {
      console.error('Error al obtener los referidos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSaveStatus = async () => {
    if (selectedReferral) {
      try {
        const response = await fetch(`https://api.cabreraapp.alexcode.org/cabrera/referrals/${selectedReferral.id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        });

        if (response.ok) {
          setReferrals((prevReferrals) =>
            prevReferrals.map((referral) =>
              referral.id === selectedReferral.id ? { ...referral, status: newStatus } : referral
            )
          );
          setModalVisible(false);
        } else {
          console.error('Error al actualizar el estado del referido');
        }
      } catch (error) {
        console.error('Error al actualizar el estado:', error);
      }
    }
  };

  return (
    <NativeBaseProvider>
      <Box flex={1} bg="gray.100" safeArea>
        <HStack bg="primary.600" px="4" py="3" alignItems="center">
          <Ionicons name="arrow-back" size={28} color="#fff" onPress={() => navigation.navigate('Admin')} />
          <Heading color="white" size="md" ml={4}>
            Total Referrals
          </Heading>
        </HStack>

        {loading ? (
          <Center flex={1}>
            <Spinner size="lg" color="primary.500" />
          </Center>
        ) : (
          <ScrollView horizontal>
            <Box width="100%" px={4}>
              {/* Cabecera de la tabla */}
              <HStack py={2} borderBottomWidth={1} borderColor="gray.300">
                <Text flex={1} textAlign="center" bold>ID</Text>
                <Text flex={1} textAlign="center" bold>User ID</Text>
                <Text flex={1} textAlign="center" bold>First Name</Text>
                <Text flex={1} textAlign="center" bold>Last Name</Text>
                <Text flex={1} textAlign="center" bold>Phone Number</Text>
                <Text flex={1.5} textAlign="center" bold>Email</Text>
                <Text flex={1} textAlign="center" bold>Vehicle Status</Text>
                <Text flex={1} textAlign="center" bold>Vehicle Brand</Text>
                <Text flex={1} textAlign="center" bold>Vehicle Model</Text>
                <Text flex={1} textAlign="center" bold>Referred By User ID</Text>
                <Text flex={1} textAlign="center" bold>Status</Text>
              </HStack>

              {/* Filas de la tabla */}
              {referrals.map((referral) => (
                <HStack key={referral.id} py={2} borderBottomWidth={1} borderColor="gray.200">
                  <Text flex={1} textAlign="center">{referral.id}</Text>
                  <Text flex={1} textAlign="center">{referral.user_id}</Text>
                  <Text flex={1} textAlign="center">{referral.first_name}</Text>
                  <Text flex={1} textAlign="center">{referral.last_name}</Text>
                  <Text flex={1} textAlign="center">{referral.phone_number}</Text>
                  <Text flex={1.5} textAlign="center">{referral.email}</Text>
                  <Text flex={1} textAlign="center">{referral.vehicle_status}</Text>
                  <Text flex={1} textAlign="center">{referral.vehicle_brand}</Text>
                  <Text flex={1} textAlign="center">{referral.vehicle_model}</Text>
                  <Text flex={1} textAlign="center">{referral.referred_by_user_id}</Text>
                  <Button flex={1} variant="link" colorScheme="blue" onPress={() => setModalVisible(true)}>
                    {referral.status}
                  </Button>
                </HStack>
              ))}
            </Box>
          </ScrollView>
        )}

        <HStack justifyContent="space-between" p={4}>
          <Button
            disabled={currentPage === 1}
            onPress={() => handlePageChange(currentPage - 1)}
            colorScheme="primary"
          >
            Previous
          </Button>
          <Text>Page {currentPage} of {totalPages}</Text>
          <Button
            disabled={currentPage === totalPages}
            onPress={() => handlePageChange(currentPage + 1)}
            colorScheme="primary"
          >
            Next
          </Button>
        </HStack>

        <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)}>
          <Modal.Content maxWidth="400px">
            <Modal.CloseButton />
            <Modal.Header>Update Status</Modal.Header>
            <Modal.Body>
              <Text>Select a new status for the referral:</Text>
              <Box mt={4}>
                {['Pending', 'Booked', 'Closed', 'Lost'].map((status) => (
                  <Button
                    key={status}
                    variant={newStatus === status ? "solid" : "outline"}
                    colorScheme="primary"
                    onPress={() => setNewStatus(status)}
                    mt={2}
                  >
                    {status}
                  </Button>
                ))}
              </Box>
            </Modal.Body>
            <Modal.Footer>
              <Button colorScheme="blue" onPress={handleSaveStatus}>
                Save
              </Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      </Box>
    </NativeBaseProvider>
  );
};

export default ReferralTable;
