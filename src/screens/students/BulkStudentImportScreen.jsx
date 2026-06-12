import React, {useMemo, useState} from 'react';
import {StyleSheet} from 'react-native';
import {HelperText, ProgressBar, Text} from 'react-native-paper';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {CustomButton, CustomInput, ScreenContainer, SectionHeader} from '../../components';
import {STUDENT_CSV_TEMPLATE} from '../../utils/csvParser';
import academicRepository from '../../repositories/academicRepository';
import sectionService from '../../services/sections/sectionService';
import studentService from '../../services/students/studentService';
import {getAccessScope} from '../../services/rbacScope';
import {colors, spacing, typography} from '../../theme';

const BulkStudentImportScreen = () => {
  const user = useSelector(state => state.auth.user);
  const scope = getAccessScope(user);
  const queryClient = useQueryClient();
  const academicYear = new Date().getFullYear();
  const [csvText, setCsvText] = useState(STUDENT_CSV_TEMPLATE);
  const [progress, setProgress] = useState({completed: 0, total: 0});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const classesQuery = useQuery({
    queryKey: ['academicClasses', user?.branchId],
    queryFn: () => academicRepository.getAcademicClasses(),
  });
  const sectionsQuery = useQuery({
    queryKey: ['sections', user?.branchId, academicYear],
    queryFn: () => sectionService.getSections({branchId: user.branchId, academicYear}, scope),
    enabled: Boolean(user?.branchId),
  });

  const classes = useMemo(
    () =>
      (classesQuery.data || []).filter(
        item =>
          item.branchId === user?.branchId &&
          (!user?.wing || user?.role !== 'COORDINATOR' || item.wing?.code === user.wing),
      ),
    [classesQuery.data, user?.branchId, user?.role, user?.wing],
  );
  const sections = useMemo(() => sectionsQuery.data?.sections || [], [sectionsQuery.data?.sections]);

  const handleImport = async () => {
    setLoading(true);
    setResult(null);
    try {
      const importResult = await studentService.importStudents(
        {csvText, classes, sections},
        scope,
        setProgress,
      );
      setResult(importResult);
      queryClient.invalidateQueries({queryKey: ['students', user?.branchId]});
      queryClient.invalidateQueries({queryKey: ['wingStudents', user?.branchId, user?.wing]});
    } finally {
      setLoading(false);
    }
  };

  const progressValue = progress.total ? progress.completed / progress.total : 0;

  return (
    <ScreenContainer>
      <SectionHeader title="Bulk Student Import" subtitle="Paste CSV content exported from your sheet" />
      <CustomInput
        label="CSV content"
        value={csvText}
        multiline
        numberOfLines={12}
        onChangeText={setCsvText}
        style={styles.csvInput}
      />
      <ProgressBar progress={progressValue} color={colors.primary} style={styles.progress} />
      <HelperText type="info" visible>
        Required columns: Full Name, Gender, DOB, Father Name, Mother Name, Parent Mobile, Class, Section.
      </HelperText>
      {result ? (
        <>
          <Text style={styles.summary}>
            Success: {result.successCount} | Failed: {result.failedCount}
          </Text>
          {result.errors.map(item => (
            <Text key={`${item.rowNumber}-${item.error}`} style={styles.error}>
              Row {item.rowNumber}: {item.error}
            </Text>
          ))}
        </>
      ) : null}
      <CustomButton loading={loading} disabled={loading || !csvText.trim()} onPress={handleImport}>
        Import Students
      </CustomButton>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  csvInput: {
    minHeight: 220,
  },
  progress: {
    height: 8,
    marginBottom: spacing.md,
  },
  summary: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.xs,
  },
});

export default BulkStudentImportScreen;
