import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Icono de la flecha
import styled from 'styled-components/native';
import colors from '../colors'; 
import { RootStackParamList } from '../App';

// Definir el tipo de los usuarios
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const UserTable: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [users, setUsers] = useState<User[]>([]); // Estado de los usuarios
  const [currentPage, setCurrentPage] = useState(1); // Estado de la página actual
  const [totalPages, setTotalPages] = useState(1); // Estado del total de páginas
  const [loading, setLoading] = useState(false); // Estado de carga
  const itemsPerPage = 5; // Número de usuarios por página

  // Función para obtener los usuarios desde la API
  const fetchUsers = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.cabreraapp.alexcode.org/cabrera/users?page=${page}&limit=${itemsPerPage}`);
      const data = await response.json();
      setUsers(data.users);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Al cambiar de página, se obtienen los usuarios nuevamente
  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  // Función para cambiar el rol del usuario entre 'user' y 'admin'
  const toggleUserRole = async (userId: number, currentRole: string) => {
    const newRole = currentRole === 'user' ? 'admin' : 'user';

    try {
      const response = await fetch(`https://api.cabreraapp.alexcode.org/cabrera/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, role: newRole } : user
          )
        );
        Alert.alert('Éxito', `El rol del usuario se actualizó a ${newRole}`);
      } else {
        Alert.alert('Error', 'No se pudo actualizar el rol del usuario');
      }
    } catch (error) {
      console.error('Error al actualizar el rol del usuario:', error);
      Alert.alert('Error', 'Error al actualizar el rol del usuario');
    }
  };

  // Función para cambiar de página
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <Container>
      <Header>
        <BackButton onPress={() => navigation.navigate('Admin')}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </BackButton>
        <HeaderText>Total Users</HeaderText>
      </Header>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <ScrollView>
          <Table>
            <TableHeader>
              <TableHeaderText style={{ flex: 0.4 }}>ID</TableHeaderText>
              <TableHeaderText style={{ flex: 1.2, textAlign: 'left' }}>Name</TableHeaderText>
              <TableHeaderText style={{ flex: 2, textAlign: 'left' }}>Email</TableHeaderText>
              <TableHeaderText style={{ flex: 1, textAlign: 'center' }}>Role</TableHeaderText>
            </TableHeader>

            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell style={{ flex: 0.4 }}>{user.id}</TableCell>
                <TableCell style={{ flex: 1.2, textAlign: 'left' }}>{user.name}</TableCell>
                <TableCell style={{ flex: 2, textAlign: 'left' }}>{user.email}</TableCell>
                <TouchableOpacity onPress={() => toggleUserRole(user.id, user.role)}>
                  <TableCell style={{ flex: 1, color: 'blue', textAlign: 'center' }}>{user.role}</TableCell>
                </TouchableOpacity>
              </TableRow>
            ))}
          </Table>
        </ScrollView>
      )}

      {/* Paginación */}
      <PaginationContainer>
        <PaginationButton
          onPress={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <PaginationButtonText>Previous</PaginationButtonText>
        </PaginationButton>

        <PaginationInfo>{`Page ${currentPage} of ${totalPages}`}</PaginationInfo>

        <PaginationButton
          onPress={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <PaginationButtonText>Next</PaginationButtonText>
        </PaginationButton>
      </PaginationContainer>
    </Container>
  );
};

export default UserTable;

// Estilos personalizados
const Container = styled.View`
  flex: 1;
  background-color: #f5f5f5;
`;

const Header = styled.View`
  width: 100%;
  background-color: #002368;
  padding: 60px 20px; /* Aumentamos el padding superior para bajar el título */
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  elevation: 4;
  shadow-color: #000;
  shadow-opacity: 0.2;
  shadow-radius: 10px;
`;

const BackButton = styled.TouchableOpacity`
  position: absolute;
  left: 20px;
  top: 45px;
`;

const HeaderText = styled.Text`
  color: #fff;
  font-size: 26px;
  font-weight: bold;
`;

const Table = styled.View`
  margin-top: 20px;
  background-color: #fff;
  border-radius: 10px;
  overflow: hidden;
  elevation: 3;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 10px;
`;

const TableHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: 10px;
  background-color: #002368;
`;

const TableHeaderText = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  text-align: center;
`;

const TableRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: 10px;
  border-bottom-width: 1px;
  border-bottom-color: #eee;
`;

const TableCell = styled.Text`
  font-size: 14px;
  color: #555;
  text-align: center;
`;

const PaginationContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
`;

const PaginationButton = styled.TouchableOpacity`
  padding: 10px 20px;
  background-color: #002368;
  border-radius: 5px;
`;

const PaginationButtonText = styled.Text`
  color: white;
  font-size: 16px;
`;

const PaginationInfo = styled.Text`
  font-size: 16px;
  color: #555;
`;
