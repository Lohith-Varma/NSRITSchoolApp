import React, {useState} from 'react';
import {Alert, View, FlatList, StyleSheet} from 'react-native';
import {Text, Switch, ActivityIndicator} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {ScreenContainer, Header, DashboardCard, EmptyState, CustomButton} from '../../components';
import {USER_ROLES} from '../../config/constants';
import academicRepository from '../../repositories/academicRepository';
import dataConnectClient from '../../services/dataconnect/dataConnectClient';
import {DATA_CONNECT_QUERIES} from '../../services/dataconnect/operations';
import {seedAcademicClasses} from '../../utils/SeedAcademicClasses';

const ClassManagementScreen = ({navigation}) => {
  const user = useSelector(state => state.auth.user);
  const queryClient = useQueryClient();
  const [seeding, setSeeding] = useState(false);
  const isMainAdmin = String(user?.role || '').toUpperCase() === USER_ROLES.MAIN_ADMIN;

  const classesQuery = useQuery({
    queryKey: ['academicClasses', 'all'],
    queryFn: () => academicRepository.getAcademicClasses(),
  });

  const activateMutation = useMutation({
    mutationFn: classId => academicRepository.activateClass(classId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['academicClasses', 'all']});
      queryClient.invalidateQueries({queryKey: ['activeAcademicClasses']});
    },
    onError: err => {
      Alert.alert('Activation Failed', err.message);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async (classItem) => {
      // Validation 1: Sections
      const sectionsRes = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_SECTIONS_BY_CLASS, {
        academicClassId: classItem.id,
      });
      if (sectionsRes.sections?.length > 0) {
        throw new Error(`Cannot deactivate: ${sectionsRes.sections.length} active section(s) exist.`);
      }

      // Validation 2: Students (using class analytics or just fetching students)
      const analyticsRes = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_CLASS_ANALYTICS, {
        academicClassId: classItem.id,
      });
      if (analyticsRes.students?.length > 0) {
        throw new Error(`Cannot deactivate: ${analyticsRes.students.length} active student(s) exist.`);
      }

      // If no sections, there can be no class teachers assigned to active sections of this class.
      return academicRepository.deactivateClass(classItem.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['academicClasses', 'all']});
      queryClient.invalidateQueries({queryKey: ['activeAcademicClasses']});
    },
    onError: err => {
      Alert.alert('Validation Failed', err.message);
    },
  });

  const handleToggle = (classItem) => {
    if (classItem.isActive) {
      deactivateMutation.mutate(classItem);
    } else {
      activateMutation.mutate(classItem.id);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    const res = await seedAcademicClasses(user.branchId);
    setSeeding(false);
    if (res.success) {
      Alert.alert('Success', `Seeded ${res.seeded} new classes.`);
      queryClient.invalidateQueries({queryKey: ['academicClasses', 'all']});
    } else {
      Alert.alert('Error', res.error || 'Failed to seed classes.');
    }
  };

  const classes = (classesQuery.data || []).filter(
    item => !user?.branchId || item.branchId === user.branchId,
  );

  return (
    <ScreenContainer>
      <Header
        title="Class Management"
        subtitle="Manage master academic classes"
        actionLabel={!isMainAdmin && classes.length === 0 ? "Seed Classes" : undefined}
        onAction={!isMainAdmin && classes.length === 0 ? handleSeed : undefined}
      />

      {seeding && <ActivityIndicator style={{marginVertical: 10}} />}

      {classes.length === 0 && !classesQuery.isLoading && !seeding && !isMainAdmin ? (
        <View style={{padding: 16, alignItems: 'center'}}>
          <Text style={{textAlign: 'center', marginBottom: 16}}>No master classes found in the database. You need to seed the initial data.</Text>
          <CustomButton onPress={handleSeed} loading={seeding}>Run Seed Script</CustomButton>
        </View>
      ) : (
        <FlatList
          data={classes}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <DashboardCard
              title={`${item.name} (${item.classCode || 'N/A'})`}
              value={item.isActive ? 'ACTIVE' : 'INACTIVE'}
              description={`Wing: ${item.wing?.name || item.wing?.code || 'Unknown'}`}
              icon="school"
              onPress={() => {}}
              rightElement={
                <Switch
                  value={item.isActive}
                  onValueChange={() => handleToggle(item)}
                  disabled={activateMutation.isPending || deactivateMutation.isPending}
                />
              }
            />
          )}
          contentContainerStyle={{paddingBottom: 20}}
        />
      )}
    </ScreenContainer>
  );
};

export default ClassManagementScreen;
