import React, {useEffect, useMemo, useState} from 'react';
import {FlatList} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  DashboardCard,
  EmptyState,
  ScreenContainer,
  SearchBar,
  SectionHeader,
  SkeletonLoader,
} from '../../components';
import {getAccessScope} from '../../services/rbacScope';
import studentService from '../../services/students/studentService';
import {fetchStudentsForRole} from '../../store/slices/studentSlice';

const ManageStudentsScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const {items, loading} = useSelector(state => state.students);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const scope = useMemo(() => getAccessScope(user), [user]);

  useEffect(() => {
    dispatch(fetchStudentsForRole(scope));
  }, [dispatch, scope]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim()) {
        const results = await studentService.searchStudents(
          {branchId: scope.branchId, searchText: query},
          scope,
        );
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, scope]);

  const data = query.trim() ? searchResults : items;

  return (
    <ScreenContainer>
      <SectionHeader title="Students" subtitle="Search by name, student ID, or parent phone" />
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search students" />
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        refreshing={loading}
        renderItem={({item}) => (
          <DashboardCard
            title={item.fullName}
            value={item.studentId}
            description={`${item.academicClass?.name || '-'}-${item.section?.name || '-'} | ${item.status || 'ACTIVE'}`}
            icon="account-school-outline"
          />
        )}
        ListEmptyComponent={
          loading ? (
            <SkeletonLoader rows={4} />
          ) : (
            <EmptyState title="No students" message="Create or upload students to see them here." />
          )
        }
      />
      <SectionHeader title="More Actions" />
      <DashboardCard
        title="Create Student"
        value="New"
        icon="account-plus-outline"
        onPress={() => navigation.navigate('CreateStudent')}
      />
      <DashboardCard
        title="Bulk CSV Upload"
        value="Upload"
        icon="file-upload-outline"
        onPress={() => navigation.navigate('BulkStudentUpload')}
      />
    </ScreenContainer>
  );
};

export default ManageStudentsScreen;
