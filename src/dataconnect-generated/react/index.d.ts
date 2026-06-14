import { CreateBranchData, CreateBranchVariables, UpdateBranchData, UpdateBranchVariables, AssignBranchAdminData, AssignBranchAdminVariables, AssignPrincipalData, AssignPrincipalVariables, CreateClassData, CreateClassVariables, ActivateClassData, ActivateClassVariables, DeactivateClassData, DeactivateClassVariables, SeedAcademicClassData, SeedAcademicClassVariables, CreateWingData, CreateWingVariables, CreateSectionData, CreateSectionVariables, RemoveSectionData, RemoveSectionVariables, CreateUserData, CreateUserVariables, ClaimUserFirebaseUidData, ClaimUserFirebaseUidVariables, CreateParentData, CreateParentVariables, CreateParentWithoutUserData, CreateParentWithoutUserVariables, CreateStudentData, CreateStudentVariables, UpdateStudentData, UpdateStudentVariables, CreateAttendanceData, CreateAttendanceVariables, UpdateAttendanceData, UpdateAttendanceVariables, UploadFeePaymentData, UploadFeePaymentVariables, AssignTeacherData, AssignTeacherVariables, CreateCoordinatorData, CreateCoordinatorVariables, CreateTeacherData, CreateTeacherVariables, AssignTeacherClassTeacherData, AssignTeacherClassTeacherVariables, UpdateTeacherData, UpdateTeacherVariables, AssignClassTeacherData, AssignClassTeacherVariables, CreateSubjectData, CreateSubjectVariables, AssignTeacherSubjectData, AssignTeacherSubjectVariables, ClearTeacherSubjectsData, ClearTeacherSubjectsVariables, CreateAccountantData, CreateAccountantVariables, ClearTeacherWingRestrictionsData, ClearTeacherWingRestrictionsVariables, UpdateClassTeacherAssignmentData, UpdateClassTeacherAssignmentVariables, RemoveClassTeacherAssignmentData, RemoveClassTeacherAssignmentVariables, UpdateAccountantData, UpdateAccountantVariables, CreateFeeCategoryData, CreateFeeCategoryVariables, UpdateFeeCategoryData, UpdateFeeCategoryVariables, CreateClassFeeData, CreateClassFeeVariables, UpdateClassFeeData, UpdateClassFeeVariables, CreateFeePlanData, CreateFeePlanVariables, UpdateFeePlanData, UpdateFeePlanVariables, ClearFeePlanItemsData, ClearFeePlanItemsVariables, CreateFeePlanItemData, CreateFeePlanItemVariables, RecordPaymentData, RecordPaymentVariables, UpdatePaymentData, UpdatePaymentVariables, ReversePaymentData, ReversePaymentVariables, RecordAuditLogData, RecordAuditLogVariables, GetCurrentUserData, GetCurrentUserVariables, GetUserByPhoneData, GetUserByPhoneVariables, GetStudentsByBranchData, GetStudentsByBranchVariables, GetStudentsBySectionData, GetStudentsBySectionVariables, GetParentChildrenData, GetParentChildrenVariables, GetParentByUserData, GetParentByUserVariables, GetParentByPhoneData, GetParentByPhoneVariables, GetBranchesData, GetBranchesVariables, GetBranchDetailsData, GetBranchDetailsVariables, GetUsersByRoleData, GetUsersByRoleVariables, GetAssignmentConflictsData, GetAssignmentConflictsVariables, GetGlobalClassesData, GetGlobalClassesVariables, GetClassDetailsData, GetClassDetailsVariables, GetGlobalStudentsData, GetGlobalStudentsVariables, GetStudentProfileData, GetStudentProfileVariables, GetStudentAttendanceData, GetStudentAttendanceVariables, GetStudentFeeHistoryData, GetStudentFeeHistoryVariables, GetDashboardStatisticsData, GetWingsByBranchData, GetWingsByBranchVariables, GetClassesByWingData, GetClassesByWingVariables, GetSectionsByClassData, GetSectionsByClassVariables, GetTeacherAssignmentsData, GetTeacherAssignmentsVariables, SearchStudentsData, SearchStudentsVariables, GetStudentIdSequenceData, GetStudentIdSequenceVariables, GetStudentDetailsData, GetStudentDetailsVariables, GetStudentsData, GetStudentsVariables, GetStaffIdSequenceData, GetStaffIdSequenceVariables, GetEmployeeSequenceData, GetEmployeeSequenceVariables, GetStaffIdsByPrefixData, GetStaffIdsByPrefixVariables, GetAttendanceByMonthData, GetAttendanceByMonthVariables, GetAttendanceBySectionData, GetAttendanceBySectionVariables, GetAttendanceByBranchData, GetAttendanceByBranchVariables, GetFeeDetailsData, GetFeeDetailsVariables, GetFeeRecordsByBranchData, GetFeeRecordsByBranchVariables, GetAllFeeRecordsData, GetAllFeeRecordsVariables, GetDueStudentsData, GetDueStudentsVariables, GetPaidStudentsData, GetPaidStudentsVariables, GetBranchAnalyticsData, GetBranchAnalyticsVariables, GetClassAnalyticsData, GetClassAnalyticsVariables, GetAcademicClassesData, GetAcademicClassesVariables, GetActiveAcademicClassesData, GetActiveAcademicClassesVariables, GetClassesByWingCodeData, GetClassesByWingCodeVariables, GetCoordinatorsData, GetCoordinatorsVariables, GetCoordinatorDetailsData, GetCoordinatorDetailsVariables, GetCoordinatorByUserData, GetCoordinatorByUserVariables, GetSectionsData, GetSectionsVariables, GetSectionsByClassAndYearData, GetSectionsByClassAndYearVariables, GetPrincipalDashboardData, GetPrincipalDashboardVariables, GetStudentsByWingData, GetStudentsByWingVariables, GetCoordinatorStudentsByWingData, GetCoordinatorStudentsByWingVariables, GetPromotionHistoryData, GetPromotionHistoryVariables, GetStudentSequenceData, GetStudentSequenceVariables, GenerateAdmissionNumberData, GenerateAdmissionNumberVariables, GetLastStudentSerialData, GetLastStudentSerialVariables, GetTeachersData, GetTeachersVariables, GetTeachersByBranchData, GetTeachersByBranchVariables, GetTeachersByWingData, GetTeachersByWingVariables, GetCoordinatorTeachersByWingData, GetCoordinatorTeachersByWingVariables, GetTeacherProfileData, GetTeacherProfileVariables, GetTeacherProfileByUserData, GetTeacherProfileByUserVariables, GetTeacherDashboardData, GetTeacherDashboardVariables, GetSubjectsData, GetSubjectsVariables, GetSectionsForTeacherAssignmentData, GetSectionsForTeacherAssignmentVariables, GetAccountantsData, GetAccountantsVariables, GetAccountantProfileData, GetAccountantProfileVariables, GetAccountantByUserData, GetAccountantByUserVariables, GetFeeCategoriesData, GetFeeCategoriesVariables, GetClassTeacherAssignmentsData, GetClassTeacherAssignmentsVariables, GetClassFeesData, GetClassFeesVariables, GetStudentFeeProfileData, GetStudentFeeProfileVariables, GetPaymentHistoryData, GetPaymentHistoryVariables, GetReceiptSequenceData, GetReceiptSequenceVariables, GetFeeReportsData, GetFeeReportsVariables, GetGlobalStudentExplorerData, GetGlobalStudentExplorerVariables, GetGlobalReportsData, GetAuditLogsData, GetAuditLogsVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateBranch(options?: useDataConnectMutationOptions<CreateBranchData, FirebaseError, CreateBranchVariables>): UseDataConnectMutationResult<CreateBranchData, CreateBranchVariables>;
export function useCreateBranch(dc: DataConnect, options?: useDataConnectMutationOptions<CreateBranchData, FirebaseError, CreateBranchVariables>): UseDataConnectMutationResult<CreateBranchData, CreateBranchVariables>;

export function useUpdateBranch(options?: useDataConnectMutationOptions<UpdateBranchData, FirebaseError, UpdateBranchVariables>): UseDataConnectMutationResult<UpdateBranchData, UpdateBranchVariables>;
export function useUpdateBranch(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateBranchData, FirebaseError, UpdateBranchVariables>): UseDataConnectMutationResult<UpdateBranchData, UpdateBranchVariables>;

export function useAssignBranchAdmin(options?: useDataConnectMutationOptions<AssignBranchAdminData, FirebaseError, AssignBranchAdminVariables>): UseDataConnectMutationResult<AssignBranchAdminData, AssignBranchAdminVariables>;
export function useAssignBranchAdmin(dc: DataConnect, options?: useDataConnectMutationOptions<AssignBranchAdminData, FirebaseError, AssignBranchAdminVariables>): UseDataConnectMutationResult<AssignBranchAdminData, AssignBranchAdminVariables>;

export function useAssignPrincipal(options?: useDataConnectMutationOptions<AssignPrincipalData, FirebaseError, AssignPrincipalVariables>): UseDataConnectMutationResult<AssignPrincipalData, AssignPrincipalVariables>;
export function useAssignPrincipal(dc: DataConnect, options?: useDataConnectMutationOptions<AssignPrincipalData, FirebaseError, AssignPrincipalVariables>): UseDataConnectMutationResult<AssignPrincipalData, AssignPrincipalVariables>;

export function useCreateClass(options?: useDataConnectMutationOptions<CreateClassData, FirebaseError, CreateClassVariables>): UseDataConnectMutationResult<CreateClassData, CreateClassVariables>;
export function useCreateClass(dc: DataConnect, options?: useDataConnectMutationOptions<CreateClassData, FirebaseError, CreateClassVariables>): UseDataConnectMutationResult<CreateClassData, CreateClassVariables>;

export function useActivateClass(options?: useDataConnectMutationOptions<ActivateClassData, FirebaseError, ActivateClassVariables>): UseDataConnectMutationResult<ActivateClassData, ActivateClassVariables>;
export function useActivateClass(dc: DataConnect, options?: useDataConnectMutationOptions<ActivateClassData, FirebaseError, ActivateClassVariables>): UseDataConnectMutationResult<ActivateClassData, ActivateClassVariables>;

export function useDeactivateClass(options?: useDataConnectMutationOptions<DeactivateClassData, FirebaseError, DeactivateClassVariables>): UseDataConnectMutationResult<DeactivateClassData, DeactivateClassVariables>;
export function useDeactivateClass(dc: DataConnect, options?: useDataConnectMutationOptions<DeactivateClassData, FirebaseError, DeactivateClassVariables>): UseDataConnectMutationResult<DeactivateClassData, DeactivateClassVariables>;

export function useSeedAcademicClass(options?: useDataConnectMutationOptions<SeedAcademicClassData, FirebaseError, SeedAcademicClassVariables>): UseDataConnectMutationResult<SeedAcademicClassData, SeedAcademicClassVariables>;
export function useSeedAcademicClass(dc: DataConnect, options?: useDataConnectMutationOptions<SeedAcademicClassData, FirebaseError, SeedAcademicClassVariables>): UseDataConnectMutationResult<SeedAcademicClassData, SeedAcademicClassVariables>;

export function useCreateWing(options?: useDataConnectMutationOptions<CreateWingData, FirebaseError, CreateWingVariables>): UseDataConnectMutationResult<CreateWingData, CreateWingVariables>;
export function useCreateWing(dc: DataConnect, options?: useDataConnectMutationOptions<CreateWingData, FirebaseError, CreateWingVariables>): UseDataConnectMutationResult<CreateWingData, CreateWingVariables>;

export function useCreateSection(options?: useDataConnectMutationOptions<CreateSectionData, FirebaseError, CreateSectionVariables>): UseDataConnectMutationResult<CreateSectionData, CreateSectionVariables>;
export function useCreateSection(dc: DataConnect, options?: useDataConnectMutationOptions<CreateSectionData, FirebaseError, CreateSectionVariables>): UseDataConnectMutationResult<CreateSectionData, CreateSectionVariables>;

export function useRemoveSection(options?: useDataConnectMutationOptions<RemoveSectionData, FirebaseError, RemoveSectionVariables>): UseDataConnectMutationResult<RemoveSectionData, RemoveSectionVariables>;
export function useRemoveSection(dc: DataConnect, options?: useDataConnectMutationOptions<RemoveSectionData, FirebaseError, RemoveSectionVariables>): UseDataConnectMutationResult<RemoveSectionData, RemoveSectionVariables>;

export function useCreateUser(options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;
export function useCreateUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;

export function useClaimUserFirebaseUid(options?: useDataConnectMutationOptions<ClaimUserFirebaseUidData, FirebaseError, ClaimUserFirebaseUidVariables>): UseDataConnectMutationResult<ClaimUserFirebaseUidData, ClaimUserFirebaseUidVariables>;
export function useClaimUserFirebaseUid(dc: DataConnect, options?: useDataConnectMutationOptions<ClaimUserFirebaseUidData, FirebaseError, ClaimUserFirebaseUidVariables>): UseDataConnectMutationResult<ClaimUserFirebaseUidData, ClaimUserFirebaseUidVariables>;

export function useCreateParent(options?: useDataConnectMutationOptions<CreateParentData, FirebaseError, CreateParentVariables>): UseDataConnectMutationResult<CreateParentData, CreateParentVariables>;
export function useCreateParent(dc: DataConnect, options?: useDataConnectMutationOptions<CreateParentData, FirebaseError, CreateParentVariables>): UseDataConnectMutationResult<CreateParentData, CreateParentVariables>;

export function useCreateParentWithoutUser(options?: useDataConnectMutationOptions<CreateParentWithoutUserData, FirebaseError, CreateParentWithoutUserVariables>): UseDataConnectMutationResult<CreateParentWithoutUserData, CreateParentWithoutUserVariables>;
export function useCreateParentWithoutUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateParentWithoutUserData, FirebaseError, CreateParentWithoutUserVariables>): UseDataConnectMutationResult<CreateParentWithoutUserData, CreateParentWithoutUserVariables>;

export function useCreateStudent(options?: useDataConnectMutationOptions<CreateStudentData, FirebaseError, CreateStudentVariables>): UseDataConnectMutationResult<CreateStudentData, CreateStudentVariables>;
export function useCreateStudent(dc: DataConnect, options?: useDataConnectMutationOptions<CreateStudentData, FirebaseError, CreateStudentVariables>): UseDataConnectMutationResult<CreateStudentData, CreateStudentVariables>;

export function useUpdateStudent(options?: useDataConnectMutationOptions<UpdateStudentData, FirebaseError, UpdateStudentVariables>): UseDataConnectMutationResult<UpdateStudentData, UpdateStudentVariables>;
export function useUpdateStudent(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateStudentData, FirebaseError, UpdateStudentVariables>): UseDataConnectMutationResult<UpdateStudentData, UpdateStudentVariables>;

export function useCreateAttendance(options?: useDataConnectMutationOptions<CreateAttendanceData, FirebaseError, CreateAttendanceVariables>): UseDataConnectMutationResult<CreateAttendanceData, CreateAttendanceVariables>;
export function useCreateAttendance(dc: DataConnect, options?: useDataConnectMutationOptions<CreateAttendanceData, FirebaseError, CreateAttendanceVariables>): UseDataConnectMutationResult<CreateAttendanceData, CreateAttendanceVariables>;

export function useUpdateAttendance(options?: useDataConnectMutationOptions<UpdateAttendanceData, FirebaseError, UpdateAttendanceVariables>): UseDataConnectMutationResult<UpdateAttendanceData, UpdateAttendanceVariables>;
export function useUpdateAttendance(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateAttendanceData, FirebaseError, UpdateAttendanceVariables>): UseDataConnectMutationResult<UpdateAttendanceData, UpdateAttendanceVariables>;

export function useUploadFeePayment(options?: useDataConnectMutationOptions<UploadFeePaymentData, FirebaseError, UploadFeePaymentVariables>): UseDataConnectMutationResult<UploadFeePaymentData, UploadFeePaymentVariables>;
export function useUploadFeePayment(dc: DataConnect, options?: useDataConnectMutationOptions<UploadFeePaymentData, FirebaseError, UploadFeePaymentVariables>): UseDataConnectMutationResult<UploadFeePaymentData, UploadFeePaymentVariables>;

export function useAssignTeacher(options?: useDataConnectMutationOptions<AssignTeacherData, FirebaseError, AssignTeacherVariables>): UseDataConnectMutationResult<AssignTeacherData, AssignTeacherVariables>;
export function useAssignTeacher(dc: DataConnect, options?: useDataConnectMutationOptions<AssignTeacherData, FirebaseError, AssignTeacherVariables>): UseDataConnectMutationResult<AssignTeacherData, AssignTeacherVariables>;

export function useCreateCoordinator(options?: useDataConnectMutationOptions<CreateCoordinatorData, FirebaseError, CreateCoordinatorVariables>): UseDataConnectMutationResult<CreateCoordinatorData, CreateCoordinatorVariables>;
export function useCreateCoordinator(dc: DataConnect, options?: useDataConnectMutationOptions<CreateCoordinatorData, FirebaseError, CreateCoordinatorVariables>): UseDataConnectMutationResult<CreateCoordinatorData, CreateCoordinatorVariables>;

export function useCreateTeacher(options?: useDataConnectMutationOptions<CreateTeacherData, FirebaseError, CreateTeacherVariables>): UseDataConnectMutationResult<CreateTeacherData, CreateTeacherVariables>;
export function useCreateTeacher(dc: DataConnect, options?: useDataConnectMutationOptions<CreateTeacherData, FirebaseError, CreateTeacherVariables>): UseDataConnectMutationResult<CreateTeacherData, CreateTeacherVariables>;

export function useAssignTeacherClassTeacher(options?: useDataConnectMutationOptions<AssignTeacherClassTeacherData, FirebaseError, AssignTeacherClassTeacherVariables>): UseDataConnectMutationResult<AssignTeacherClassTeacherData, AssignTeacherClassTeacherVariables>;
export function useAssignTeacherClassTeacher(dc: DataConnect, options?: useDataConnectMutationOptions<AssignTeacherClassTeacherData, FirebaseError, AssignTeacherClassTeacherVariables>): UseDataConnectMutationResult<AssignTeacherClassTeacherData, AssignTeacherClassTeacherVariables>;

export function useUpdateTeacher(options?: useDataConnectMutationOptions<UpdateTeacherData, FirebaseError, UpdateTeacherVariables>): UseDataConnectMutationResult<UpdateTeacherData, UpdateTeacherVariables>;
export function useUpdateTeacher(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateTeacherData, FirebaseError, UpdateTeacherVariables>): UseDataConnectMutationResult<UpdateTeacherData, UpdateTeacherVariables>;

export function useAssignClassTeacher(options?: useDataConnectMutationOptions<AssignClassTeacherData, FirebaseError, AssignClassTeacherVariables>): UseDataConnectMutationResult<AssignClassTeacherData, AssignClassTeacherVariables>;
export function useAssignClassTeacher(dc: DataConnect, options?: useDataConnectMutationOptions<AssignClassTeacherData, FirebaseError, AssignClassTeacherVariables>): UseDataConnectMutationResult<AssignClassTeacherData, AssignClassTeacherVariables>;

export function useCreateSubject(options?: useDataConnectMutationOptions<CreateSubjectData, FirebaseError, CreateSubjectVariables>): UseDataConnectMutationResult<CreateSubjectData, CreateSubjectVariables>;
export function useCreateSubject(dc: DataConnect, options?: useDataConnectMutationOptions<CreateSubjectData, FirebaseError, CreateSubjectVariables>): UseDataConnectMutationResult<CreateSubjectData, CreateSubjectVariables>;

export function useAssignTeacherSubject(options?: useDataConnectMutationOptions<AssignTeacherSubjectData, FirebaseError, AssignTeacherSubjectVariables>): UseDataConnectMutationResult<AssignTeacherSubjectData, AssignTeacherSubjectVariables>;
export function useAssignTeacherSubject(dc: DataConnect, options?: useDataConnectMutationOptions<AssignTeacherSubjectData, FirebaseError, AssignTeacherSubjectVariables>): UseDataConnectMutationResult<AssignTeacherSubjectData, AssignTeacherSubjectVariables>;

export function useClearTeacherSubjects(options?: useDataConnectMutationOptions<ClearTeacherSubjectsData, FirebaseError, ClearTeacherSubjectsVariables>): UseDataConnectMutationResult<ClearTeacherSubjectsData, ClearTeacherSubjectsVariables>;
export function useClearTeacherSubjects(dc: DataConnect, options?: useDataConnectMutationOptions<ClearTeacherSubjectsData, FirebaseError, ClearTeacherSubjectsVariables>): UseDataConnectMutationResult<ClearTeacherSubjectsData, ClearTeacherSubjectsVariables>;

export function useCreateAccountant(options?: useDataConnectMutationOptions<CreateAccountantData, FirebaseError, CreateAccountantVariables>): UseDataConnectMutationResult<CreateAccountantData, CreateAccountantVariables>;
export function useCreateAccountant(dc: DataConnect, options?: useDataConnectMutationOptions<CreateAccountantData, FirebaseError, CreateAccountantVariables>): UseDataConnectMutationResult<CreateAccountantData, CreateAccountantVariables>;

export function useClearTeacherWingRestrictions(options?: useDataConnectMutationOptions<ClearTeacherWingRestrictionsData, FirebaseError, ClearTeacherWingRestrictionsVariables>): UseDataConnectMutationResult<ClearTeacherWingRestrictionsData, ClearTeacherWingRestrictionsVariables>;
export function useClearTeacherWingRestrictions(dc: DataConnect, options?: useDataConnectMutationOptions<ClearTeacherWingRestrictionsData, FirebaseError, ClearTeacherWingRestrictionsVariables>): UseDataConnectMutationResult<ClearTeacherWingRestrictionsData, ClearTeacherWingRestrictionsVariables>;

export function useUpdateClassTeacherAssignment(options?: useDataConnectMutationOptions<UpdateClassTeacherAssignmentData, FirebaseError, UpdateClassTeacherAssignmentVariables>): UseDataConnectMutationResult<UpdateClassTeacherAssignmentData, UpdateClassTeacherAssignmentVariables>;
export function useUpdateClassTeacherAssignment(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateClassTeacherAssignmentData, FirebaseError, UpdateClassTeacherAssignmentVariables>): UseDataConnectMutationResult<UpdateClassTeacherAssignmentData, UpdateClassTeacherAssignmentVariables>;

export function useRemoveClassTeacherAssignment(options?: useDataConnectMutationOptions<RemoveClassTeacherAssignmentData, FirebaseError, RemoveClassTeacherAssignmentVariables>): UseDataConnectMutationResult<RemoveClassTeacherAssignmentData, RemoveClassTeacherAssignmentVariables>;
export function useRemoveClassTeacherAssignment(dc: DataConnect, options?: useDataConnectMutationOptions<RemoveClassTeacherAssignmentData, FirebaseError, RemoveClassTeacherAssignmentVariables>): UseDataConnectMutationResult<RemoveClassTeacherAssignmentData, RemoveClassTeacherAssignmentVariables>;

export function useUpdateAccountant(options?: useDataConnectMutationOptions<UpdateAccountantData, FirebaseError, UpdateAccountantVariables>): UseDataConnectMutationResult<UpdateAccountantData, UpdateAccountantVariables>;
export function useUpdateAccountant(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateAccountantData, FirebaseError, UpdateAccountantVariables>): UseDataConnectMutationResult<UpdateAccountantData, UpdateAccountantVariables>;

export function useCreateFeeCategory(options?: useDataConnectMutationOptions<CreateFeeCategoryData, FirebaseError, CreateFeeCategoryVariables>): UseDataConnectMutationResult<CreateFeeCategoryData, CreateFeeCategoryVariables>;
export function useCreateFeeCategory(dc: DataConnect, options?: useDataConnectMutationOptions<CreateFeeCategoryData, FirebaseError, CreateFeeCategoryVariables>): UseDataConnectMutationResult<CreateFeeCategoryData, CreateFeeCategoryVariables>;

export function useUpdateFeeCategory(options?: useDataConnectMutationOptions<UpdateFeeCategoryData, FirebaseError, UpdateFeeCategoryVariables>): UseDataConnectMutationResult<UpdateFeeCategoryData, UpdateFeeCategoryVariables>;
export function useUpdateFeeCategory(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateFeeCategoryData, FirebaseError, UpdateFeeCategoryVariables>): UseDataConnectMutationResult<UpdateFeeCategoryData, UpdateFeeCategoryVariables>;

export function useCreateClassFee(options?: useDataConnectMutationOptions<CreateClassFeeData, FirebaseError, CreateClassFeeVariables>): UseDataConnectMutationResult<CreateClassFeeData, CreateClassFeeVariables>;
export function useCreateClassFee(dc: DataConnect, options?: useDataConnectMutationOptions<CreateClassFeeData, FirebaseError, CreateClassFeeVariables>): UseDataConnectMutationResult<CreateClassFeeData, CreateClassFeeVariables>;

export function useUpdateClassFee(options?: useDataConnectMutationOptions<UpdateClassFeeData, FirebaseError, UpdateClassFeeVariables>): UseDataConnectMutationResult<UpdateClassFeeData, UpdateClassFeeVariables>;
export function useUpdateClassFee(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateClassFeeData, FirebaseError, UpdateClassFeeVariables>): UseDataConnectMutationResult<UpdateClassFeeData, UpdateClassFeeVariables>;

export function useCreateFeePlan(options?: useDataConnectMutationOptions<CreateFeePlanData, FirebaseError, CreateFeePlanVariables>): UseDataConnectMutationResult<CreateFeePlanData, CreateFeePlanVariables>;
export function useCreateFeePlan(dc: DataConnect, options?: useDataConnectMutationOptions<CreateFeePlanData, FirebaseError, CreateFeePlanVariables>): UseDataConnectMutationResult<CreateFeePlanData, CreateFeePlanVariables>;

export function useUpdateFeePlan(options?: useDataConnectMutationOptions<UpdateFeePlanData, FirebaseError, UpdateFeePlanVariables>): UseDataConnectMutationResult<UpdateFeePlanData, UpdateFeePlanVariables>;
export function useUpdateFeePlan(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateFeePlanData, FirebaseError, UpdateFeePlanVariables>): UseDataConnectMutationResult<UpdateFeePlanData, UpdateFeePlanVariables>;

export function useClearFeePlanItems(options?: useDataConnectMutationOptions<ClearFeePlanItemsData, FirebaseError, ClearFeePlanItemsVariables>): UseDataConnectMutationResult<ClearFeePlanItemsData, ClearFeePlanItemsVariables>;
export function useClearFeePlanItems(dc: DataConnect, options?: useDataConnectMutationOptions<ClearFeePlanItemsData, FirebaseError, ClearFeePlanItemsVariables>): UseDataConnectMutationResult<ClearFeePlanItemsData, ClearFeePlanItemsVariables>;

export function useCreateFeePlanItem(options?: useDataConnectMutationOptions<CreateFeePlanItemData, FirebaseError, CreateFeePlanItemVariables>): UseDataConnectMutationResult<CreateFeePlanItemData, CreateFeePlanItemVariables>;
export function useCreateFeePlanItem(dc: DataConnect, options?: useDataConnectMutationOptions<CreateFeePlanItemData, FirebaseError, CreateFeePlanItemVariables>): UseDataConnectMutationResult<CreateFeePlanItemData, CreateFeePlanItemVariables>;

export function useRecordPayment(options?: useDataConnectMutationOptions<RecordPaymentData, FirebaseError, RecordPaymentVariables>): UseDataConnectMutationResult<RecordPaymentData, RecordPaymentVariables>;
export function useRecordPayment(dc: DataConnect, options?: useDataConnectMutationOptions<RecordPaymentData, FirebaseError, RecordPaymentVariables>): UseDataConnectMutationResult<RecordPaymentData, RecordPaymentVariables>;

export function useUpdatePayment(options?: useDataConnectMutationOptions<UpdatePaymentData, FirebaseError, UpdatePaymentVariables>): UseDataConnectMutationResult<UpdatePaymentData, UpdatePaymentVariables>;
export function useUpdatePayment(dc: DataConnect, options?: useDataConnectMutationOptions<UpdatePaymentData, FirebaseError, UpdatePaymentVariables>): UseDataConnectMutationResult<UpdatePaymentData, UpdatePaymentVariables>;

export function useReversePayment(options?: useDataConnectMutationOptions<ReversePaymentData, FirebaseError, ReversePaymentVariables>): UseDataConnectMutationResult<ReversePaymentData, ReversePaymentVariables>;
export function useReversePayment(dc: DataConnect, options?: useDataConnectMutationOptions<ReversePaymentData, FirebaseError, ReversePaymentVariables>): UseDataConnectMutationResult<ReversePaymentData, ReversePaymentVariables>;

export function useRecordAuditLog(options?: useDataConnectMutationOptions<RecordAuditLogData, FirebaseError, RecordAuditLogVariables>): UseDataConnectMutationResult<RecordAuditLogData, RecordAuditLogVariables>;
export function useRecordAuditLog(dc: DataConnect, options?: useDataConnectMutationOptions<RecordAuditLogData, FirebaseError, RecordAuditLogVariables>): UseDataConnectMutationResult<RecordAuditLogData, RecordAuditLogVariables>;

export function useGetCurrentUser(vars: GetCurrentUserVariables, options?: useDataConnectQueryOptions<GetCurrentUserData>): UseDataConnectQueryResult<GetCurrentUserData, GetCurrentUserVariables>;
export function useGetCurrentUser(dc: DataConnect, vars: GetCurrentUserVariables, options?: useDataConnectQueryOptions<GetCurrentUserData>): UseDataConnectQueryResult<GetCurrentUserData, GetCurrentUserVariables>;

export function useGetUserByPhone(vars: GetUserByPhoneVariables, options?: useDataConnectQueryOptions<GetUserByPhoneData>): UseDataConnectQueryResult<GetUserByPhoneData, GetUserByPhoneVariables>;
export function useGetUserByPhone(dc: DataConnect, vars: GetUserByPhoneVariables, options?: useDataConnectQueryOptions<GetUserByPhoneData>): UseDataConnectQueryResult<GetUserByPhoneData, GetUserByPhoneVariables>;

export function useGetStudentsByBranch(vars: GetStudentsByBranchVariables, options?: useDataConnectQueryOptions<GetStudentsByBranchData>): UseDataConnectQueryResult<GetStudentsByBranchData, GetStudentsByBranchVariables>;
export function useGetStudentsByBranch(dc: DataConnect, vars: GetStudentsByBranchVariables, options?: useDataConnectQueryOptions<GetStudentsByBranchData>): UseDataConnectQueryResult<GetStudentsByBranchData, GetStudentsByBranchVariables>;

export function useGetStudentsBySection(vars: GetStudentsBySectionVariables, options?: useDataConnectQueryOptions<GetStudentsBySectionData>): UseDataConnectQueryResult<GetStudentsBySectionData, GetStudentsBySectionVariables>;
export function useGetStudentsBySection(dc: DataConnect, vars: GetStudentsBySectionVariables, options?: useDataConnectQueryOptions<GetStudentsBySectionData>): UseDataConnectQueryResult<GetStudentsBySectionData, GetStudentsBySectionVariables>;

export function useGetParentChildren(vars: GetParentChildrenVariables, options?: useDataConnectQueryOptions<GetParentChildrenData>): UseDataConnectQueryResult<GetParentChildrenData, GetParentChildrenVariables>;
export function useGetParentChildren(dc: DataConnect, vars: GetParentChildrenVariables, options?: useDataConnectQueryOptions<GetParentChildrenData>): UseDataConnectQueryResult<GetParentChildrenData, GetParentChildrenVariables>;

export function useGetParentByUser(vars: GetParentByUserVariables, options?: useDataConnectQueryOptions<GetParentByUserData>): UseDataConnectQueryResult<GetParentByUserData, GetParentByUserVariables>;
export function useGetParentByUser(dc: DataConnect, vars: GetParentByUserVariables, options?: useDataConnectQueryOptions<GetParentByUserData>): UseDataConnectQueryResult<GetParentByUserData, GetParentByUserVariables>;

export function useGetParentByPhone(vars: GetParentByPhoneVariables, options?: useDataConnectQueryOptions<GetParentByPhoneData>): UseDataConnectQueryResult<GetParentByPhoneData, GetParentByPhoneVariables>;
export function useGetParentByPhone(dc: DataConnect, vars: GetParentByPhoneVariables, options?: useDataConnectQueryOptions<GetParentByPhoneData>): UseDataConnectQueryResult<GetParentByPhoneData, GetParentByPhoneVariables>;

export function useGetBranches(vars?: GetBranchesVariables, options?: useDataConnectQueryOptions<GetBranchesData>): UseDataConnectQueryResult<GetBranchesData, GetBranchesVariables>;
export function useGetBranches(dc: DataConnect, vars?: GetBranchesVariables, options?: useDataConnectQueryOptions<GetBranchesData>): UseDataConnectQueryResult<GetBranchesData, GetBranchesVariables>;

export function useGetBranchDetails(vars: GetBranchDetailsVariables, options?: useDataConnectQueryOptions<GetBranchDetailsData>): UseDataConnectQueryResult<GetBranchDetailsData, GetBranchDetailsVariables>;
export function useGetBranchDetails(dc: DataConnect, vars: GetBranchDetailsVariables, options?: useDataConnectQueryOptions<GetBranchDetailsData>): UseDataConnectQueryResult<GetBranchDetailsData, GetBranchDetailsVariables>;

export function useGetUsersByRole(vars: GetUsersByRoleVariables, options?: useDataConnectQueryOptions<GetUsersByRoleData>): UseDataConnectQueryResult<GetUsersByRoleData, GetUsersByRoleVariables>;
export function useGetUsersByRole(dc: DataConnect, vars: GetUsersByRoleVariables, options?: useDataConnectQueryOptions<GetUsersByRoleData>): UseDataConnectQueryResult<GetUsersByRoleData, GetUsersByRoleVariables>;

export function useGetAssignmentConflicts(vars: GetAssignmentConflictsVariables, options?: useDataConnectQueryOptions<GetAssignmentConflictsData>): UseDataConnectQueryResult<GetAssignmentConflictsData, GetAssignmentConflictsVariables>;
export function useGetAssignmentConflicts(dc: DataConnect, vars: GetAssignmentConflictsVariables, options?: useDataConnectQueryOptions<GetAssignmentConflictsData>): UseDataConnectQueryResult<GetAssignmentConflictsData, GetAssignmentConflictsVariables>;

export function useGetGlobalClasses(vars?: GetGlobalClassesVariables, options?: useDataConnectQueryOptions<GetGlobalClassesData>): UseDataConnectQueryResult<GetGlobalClassesData, GetGlobalClassesVariables>;
export function useGetGlobalClasses(dc: DataConnect, vars?: GetGlobalClassesVariables, options?: useDataConnectQueryOptions<GetGlobalClassesData>): UseDataConnectQueryResult<GetGlobalClassesData, GetGlobalClassesVariables>;

export function useGetClassDetails(vars: GetClassDetailsVariables, options?: useDataConnectQueryOptions<GetClassDetailsData>): UseDataConnectQueryResult<GetClassDetailsData, GetClassDetailsVariables>;
export function useGetClassDetails(dc: DataConnect, vars: GetClassDetailsVariables, options?: useDataConnectQueryOptions<GetClassDetailsData>): UseDataConnectQueryResult<GetClassDetailsData, GetClassDetailsVariables>;

export function useGetGlobalStudents(vars?: GetGlobalStudentsVariables, options?: useDataConnectQueryOptions<GetGlobalStudentsData>): UseDataConnectQueryResult<GetGlobalStudentsData, GetGlobalStudentsVariables>;
export function useGetGlobalStudents(dc: DataConnect, vars?: GetGlobalStudentsVariables, options?: useDataConnectQueryOptions<GetGlobalStudentsData>): UseDataConnectQueryResult<GetGlobalStudentsData, GetGlobalStudentsVariables>;

export function useGetStudentProfile(vars: GetStudentProfileVariables, options?: useDataConnectQueryOptions<GetStudentProfileData>): UseDataConnectQueryResult<GetStudentProfileData, GetStudentProfileVariables>;
export function useGetStudentProfile(dc: DataConnect, vars: GetStudentProfileVariables, options?: useDataConnectQueryOptions<GetStudentProfileData>): UseDataConnectQueryResult<GetStudentProfileData, GetStudentProfileVariables>;

export function useGetStudentAttendance(vars: GetStudentAttendanceVariables, options?: useDataConnectQueryOptions<GetStudentAttendanceData>): UseDataConnectQueryResult<GetStudentAttendanceData, GetStudentAttendanceVariables>;
export function useGetStudentAttendance(dc: DataConnect, vars: GetStudentAttendanceVariables, options?: useDataConnectQueryOptions<GetStudentAttendanceData>): UseDataConnectQueryResult<GetStudentAttendanceData, GetStudentAttendanceVariables>;

export function useGetStudentFeeHistory(vars: GetStudentFeeHistoryVariables, options?: useDataConnectQueryOptions<GetStudentFeeHistoryData>): UseDataConnectQueryResult<GetStudentFeeHistoryData, GetStudentFeeHistoryVariables>;
export function useGetStudentFeeHistory(dc: DataConnect, vars: GetStudentFeeHistoryVariables, options?: useDataConnectQueryOptions<GetStudentFeeHistoryData>): UseDataConnectQueryResult<GetStudentFeeHistoryData, GetStudentFeeHistoryVariables>;

export function useGetDashboardStatistics(options?: useDataConnectQueryOptions<GetDashboardStatisticsData>): UseDataConnectQueryResult<GetDashboardStatisticsData, undefined>;
export function useGetDashboardStatistics(dc: DataConnect, options?: useDataConnectQueryOptions<GetDashboardStatisticsData>): UseDataConnectQueryResult<GetDashboardStatisticsData, undefined>;

export function useGetWingsByBranch(vars: GetWingsByBranchVariables, options?: useDataConnectQueryOptions<GetWingsByBranchData>): UseDataConnectQueryResult<GetWingsByBranchData, GetWingsByBranchVariables>;
export function useGetWingsByBranch(dc: DataConnect, vars: GetWingsByBranchVariables, options?: useDataConnectQueryOptions<GetWingsByBranchData>): UseDataConnectQueryResult<GetWingsByBranchData, GetWingsByBranchVariables>;

export function useGetClassesByWing(vars: GetClassesByWingVariables, options?: useDataConnectQueryOptions<GetClassesByWingData>): UseDataConnectQueryResult<GetClassesByWingData, GetClassesByWingVariables>;
export function useGetClassesByWing(dc: DataConnect, vars: GetClassesByWingVariables, options?: useDataConnectQueryOptions<GetClassesByWingData>): UseDataConnectQueryResult<GetClassesByWingData, GetClassesByWingVariables>;

export function useGetSectionsByClass(vars: GetSectionsByClassVariables, options?: useDataConnectQueryOptions<GetSectionsByClassData>): UseDataConnectQueryResult<GetSectionsByClassData, GetSectionsByClassVariables>;
export function useGetSectionsByClass(dc: DataConnect, vars: GetSectionsByClassVariables, options?: useDataConnectQueryOptions<GetSectionsByClassData>): UseDataConnectQueryResult<GetSectionsByClassData, GetSectionsByClassVariables>;

export function useGetTeacherAssignments(vars: GetTeacherAssignmentsVariables, options?: useDataConnectQueryOptions<GetTeacherAssignmentsData>): UseDataConnectQueryResult<GetTeacherAssignmentsData, GetTeacherAssignmentsVariables>;
export function useGetTeacherAssignments(dc: DataConnect, vars: GetTeacherAssignmentsVariables, options?: useDataConnectQueryOptions<GetTeacherAssignmentsData>): UseDataConnectQueryResult<GetTeacherAssignmentsData, GetTeacherAssignmentsVariables>;

export function useSearchStudents(vars: SearchStudentsVariables, options?: useDataConnectQueryOptions<SearchStudentsData>): UseDataConnectQueryResult<SearchStudentsData, SearchStudentsVariables>;
export function useSearchStudents(dc: DataConnect, vars: SearchStudentsVariables, options?: useDataConnectQueryOptions<SearchStudentsData>): UseDataConnectQueryResult<SearchStudentsData, SearchStudentsVariables>;

export function useGetStudentIdSequence(vars: GetStudentIdSequenceVariables, options?: useDataConnectQueryOptions<GetStudentIdSequenceData>): UseDataConnectQueryResult<GetStudentIdSequenceData, GetStudentIdSequenceVariables>;
export function useGetStudentIdSequence(dc: DataConnect, vars: GetStudentIdSequenceVariables, options?: useDataConnectQueryOptions<GetStudentIdSequenceData>): UseDataConnectQueryResult<GetStudentIdSequenceData, GetStudentIdSequenceVariables>;

export function useGetStudentDetails(vars: GetStudentDetailsVariables, options?: useDataConnectQueryOptions<GetStudentDetailsData>): UseDataConnectQueryResult<GetStudentDetailsData, GetStudentDetailsVariables>;
export function useGetStudentDetails(dc: DataConnect, vars: GetStudentDetailsVariables, options?: useDataConnectQueryOptions<GetStudentDetailsData>): UseDataConnectQueryResult<GetStudentDetailsData, GetStudentDetailsVariables>;

export function useGetStudents(vars: GetStudentsVariables, options?: useDataConnectQueryOptions<GetStudentsData>): UseDataConnectQueryResult<GetStudentsData, GetStudentsVariables>;
export function useGetStudents(dc: DataConnect, vars: GetStudentsVariables, options?: useDataConnectQueryOptions<GetStudentsData>): UseDataConnectQueryResult<GetStudentsData, GetStudentsVariables>;

export function useGetStaffIdSequence(vars: GetStaffIdSequenceVariables, options?: useDataConnectQueryOptions<GetStaffIdSequenceData>): UseDataConnectQueryResult<GetStaffIdSequenceData, GetStaffIdSequenceVariables>;
export function useGetStaffIdSequence(dc: DataConnect, vars: GetStaffIdSequenceVariables, options?: useDataConnectQueryOptions<GetStaffIdSequenceData>): UseDataConnectQueryResult<GetStaffIdSequenceData, GetStaffIdSequenceVariables>;

export function useGetEmployeeSequence(vars: GetEmployeeSequenceVariables, options?: useDataConnectQueryOptions<GetEmployeeSequenceData>): UseDataConnectQueryResult<GetEmployeeSequenceData, GetEmployeeSequenceVariables>;
export function useGetEmployeeSequence(dc: DataConnect, vars: GetEmployeeSequenceVariables, options?: useDataConnectQueryOptions<GetEmployeeSequenceData>): UseDataConnectQueryResult<GetEmployeeSequenceData, GetEmployeeSequenceVariables>;

export function useGetStaffIdsByPrefix(vars: GetStaffIdsByPrefixVariables, options?: useDataConnectQueryOptions<GetStaffIdsByPrefixData>): UseDataConnectQueryResult<GetStaffIdsByPrefixData, GetStaffIdsByPrefixVariables>;
export function useGetStaffIdsByPrefix(dc: DataConnect, vars: GetStaffIdsByPrefixVariables, options?: useDataConnectQueryOptions<GetStaffIdsByPrefixData>): UseDataConnectQueryResult<GetStaffIdsByPrefixData, GetStaffIdsByPrefixVariables>;

export function useGetAttendanceByMonth(vars: GetAttendanceByMonthVariables, options?: useDataConnectQueryOptions<GetAttendanceByMonthData>): UseDataConnectQueryResult<GetAttendanceByMonthData, GetAttendanceByMonthVariables>;
export function useGetAttendanceByMonth(dc: DataConnect, vars: GetAttendanceByMonthVariables, options?: useDataConnectQueryOptions<GetAttendanceByMonthData>): UseDataConnectQueryResult<GetAttendanceByMonthData, GetAttendanceByMonthVariables>;

export function useGetAttendanceBySection(vars: GetAttendanceBySectionVariables, options?: useDataConnectQueryOptions<GetAttendanceBySectionData>): UseDataConnectQueryResult<GetAttendanceBySectionData, GetAttendanceBySectionVariables>;
export function useGetAttendanceBySection(dc: DataConnect, vars: GetAttendanceBySectionVariables, options?: useDataConnectQueryOptions<GetAttendanceBySectionData>): UseDataConnectQueryResult<GetAttendanceBySectionData, GetAttendanceBySectionVariables>;

export function useGetAttendanceByBranch(vars: GetAttendanceByBranchVariables, options?: useDataConnectQueryOptions<GetAttendanceByBranchData>): UseDataConnectQueryResult<GetAttendanceByBranchData, GetAttendanceByBranchVariables>;
export function useGetAttendanceByBranch(dc: DataConnect, vars: GetAttendanceByBranchVariables, options?: useDataConnectQueryOptions<GetAttendanceByBranchData>): UseDataConnectQueryResult<GetAttendanceByBranchData, GetAttendanceByBranchVariables>;

export function useGetFeeDetails(vars: GetFeeDetailsVariables, options?: useDataConnectQueryOptions<GetFeeDetailsData>): UseDataConnectQueryResult<GetFeeDetailsData, GetFeeDetailsVariables>;
export function useGetFeeDetails(dc: DataConnect, vars: GetFeeDetailsVariables, options?: useDataConnectQueryOptions<GetFeeDetailsData>): UseDataConnectQueryResult<GetFeeDetailsData, GetFeeDetailsVariables>;

export function useGetFeeRecordsByBranch(vars: GetFeeRecordsByBranchVariables, options?: useDataConnectQueryOptions<GetFeeRecordsByBranchData>): UseDataConnectQueryResult<GetFeeRecordsByBranchData, GetFeeRecordsByBranchVariables>;
export function useGetFeeRecordsByBranch(dc: DataConnect, vars: GetFeeRecordsByBranchVariables, options?: useDataConnectQueryOptions<GetFeeRecordsByBranchData>): UseDataConnectQueryResult<GetFeeRecordsByBranchData, GetFeeRecordsByBranchVariables>;

export function useGetAllFeeRecords(vars?: GetAllFeeRecordsVariables, options?: useDataConnectQueryOptions<GetAllFeeRecordsData>): UseDataConnectQueryResult<GetAllFeeRecordsData, GetAllFeeRecordsVariables>;
export function useGetAllFeeRecords(dc: DataConnect, vars?: GetAllFeeRecordsVariables, options?: useDataConnectQueryOptions<GetAllFeeRecordsData>): UseDataConnectQueryResult<GetAllFeeRecordsData, GetAllFeeRecordsVariables>;

export function useGetDueStudents(vars: GetDueStudentsVariables, options?: useDataConnectQueryOptions<GetDueStudentsData>): UseDataConnectQueryResult<GetDueStudentsData, GetDueStudentsVariables>;
export function useGetDueStudents(dc: DataConnect, vars: GetDueStudentsVariables, options?: useDataConnectQueryOptions<GetDueStudentsData>): UseDataConnectQueryResult<GetDueStudentsData, GetDueStudentsVariables>;

export function useGetPaidStudents(vars: GetPaidStudentsVariables, options?: useDataConnectQueryOptions<GetPaidStudentsData>): UseDataConnectQueryResult<GetPaidStudentsData, GetPaidStudentsVariables>;
export function useGetPaidStudents(dc: DataConnect, vars: GetPaidStudentsVariables, options?: useDataConnectQueryOptions<GetPaidStudentsData>): UseDataConnectQueryResult<GetPaidStudentsData, GetPaidStudentsVariables>;

export function useGetBranchAnalytics(vars: GetBranchAnalyticsVariables, options?: useDataConnectQueryOptions<GetBranchAnalyticsData>): UseDataConnectQueryResult<GetBranchAnalyticsData, GetBranchAnalyticsVariables>;
export function useGetBranchAnalytics(dc: DataConnect, vars: GetBranchAnalyticsVariables, options?: useDataConnectQueryOptions<GetBranchAnalyticsData>): UseDataConnectQueryResult<GetBranchAnalyticsData, GetBranchAnalyticsVariables>;

export function useGetClassAnalytics(vars: GetClassAnalyticsVariables, options?: useDataConnectQueryOptions<GetClassAnalyticsData>): UseDataConnectQueryResult<GetClassAnalyticsData, GetClassAnalyticsVariables>;
export function useGetClassAnalytics(dc: DataConnect, vars: GetClassAnalyticsVariables, options?: useDataConnectQueryOptions<GetClassAnalyticsData>): UseDataConnectQueryResult<GetClassAnalyticsData, GetClassAnalyticsVariables>;

export function useGetAcademicClasses(vars?: GetAcademicClassesVariables, options?: useDataConnectQueryOptions<GetAcademicClassesData>): UseDataConnectQueryResult<GetAcademicClassesData, GetAcademicClassesVariables>;
export function useGetAcademicClasses(dc: DataConnect, vars?: GetAcademicClassesVariables, options?: useDataConnectQueryOptions<GetAcademicClassesData>): UseDataConnectQueryResult<GetAcademicClassesData, GetAcademicClassesVariables>;

export function useGetActiveAcademicClasses(vars?: GetActiveAcademicClassesVariables, options?: useDataConnectQueryOptions<GetActiveAcademicClassesData>): UseDataConnectQueryResult<GetActiveAcademicClassesData, GetActiveAcademicClassesVariables>;
export function useGetActiveAcademicClasses(dc: DataConnect, vars?: GetActiveAcademicClassesVariables, options?: useDataConnectQueryOptions<GetActiveAcademicClassesData>): UseDataConnectQueryResult<GetActiveAcademicClassesData, GetActiveAcademicClassesVariables>;

export function useGetClassesByWingCode(vars: GetClassesByWingCodeVariables, options?: useDataConnectQueryOptions<GetClassesByWingCodeData>): UseDataConnectQueryResult<GetClassesByWingCodeData, GetClassesByWingCodeVariables>;
export function useGetClassesByWingCode(dc: DataConnect, vars: GetClassesByWingCodeVariables, options?: useDataConnectQueryOptions<GetClassesByWingCodeData>): UseDataConnectQueryResult<GetClassesByWingCodeData, GetClassesByWingCodeVariables>;

export function useGetCoordinators(vars: GetCoordinatorsVariables, options?: useDataConnectQueryOptions<GetCoordinatorsData>): UseDataConnectQueryResult<GetCoordinatorsData, GetCoordinatorsVariables>;
export function useGetCoordinators(dc: DataConnect, vars: GetCoordinatorsVariables, options?: useDataConnectQueryOptions<GetCoordinatorsData>): UseDataConnectQueryResult<GetCoordinatorsData, GetCoordinatorsVariables>;

export function useGetCoordinatorDetails(vars: GetCoordinatorDetailsVariables, options?: useDataConnectQueryOptions<GetCoordinatorDetailsData>): UseDataConnectQueryResult<GetCoordinatorDetailsData, GetCoordinatorDetailsVariables>;
export function useGetCoordinatorDetails(dc: DataConnect, vars: GetCoordinatorDetailsVariables, options?: useDataConnectQueryOptions<GetCoordinatorDetailsData>): UseDataConnectQueryResult<GetCoordinatorDetailsData, GetCoordinatorDetailsVariables>;

export function useGetCoordinatorByUser(vars: GetCoordinatorByUserVariables, options?: useDataConnectQueryOptions<GetCoordinatorByUserData>): UseDataConnectQueryResult<GetCoordinatorByUserData, GetCoordinatorByUserVariables>;
export function useGetCoordinatorByUser(dc: DataConnect, vars: GetCoordinatorByUserVariables, options?: useDataConnectQueryOptions<GetCoordinatorByUserData>): UseDataConnectQueryResult<GetCoordinatorByUserData, GetCoordinatorByUserVariables>;

export function useGetSections(vars: GetSectionsVariables, options?: useDataConnectQueryOptions<GetSectionsData>): UseDataConnectQueryResult<GetSectionsData, GetSectionsVariables>;
export function useGetSections(dc: DataConnect, vars: GetSectionsVariables, options?: useDataConnectQueryOptions<GetSectionsData>): UseDataConnectQueryResult<GetSectionsData, GetSectionsVariables>;

export function useGetSectionsByClassAndYear(vars: GetSectionsByClassAndYearVariables, options?: useDataConnectQueryOptions<GetSectionsByClassAndYearData>): UseDataConnectQueryResult<GetSectionsByClassAndYearData, GetSectionsByClassAndYearVariables>;
export function useGetSectionsByClassAndYear(dc: DataConnect, vars: GetSectionsByClassAndYearVariables, options?: useDataConnectQueryOptions<GetSectionsByClassAndYearData>): UseDataConnectQueryResult<GetSectionsByClassAndYearData, GetSectionsByClassAndYearVariables>;

export function useGetPrincipalDashboard(vars: GetPrincipalDashboardVariables, options?: useDataConnectQueryOptions<GetPrincipalDashboardData>): UseDataConnectQueryResult<GetPrincipalDashboardData, GetPrincipalDashboardVariables>;
export function useGetPrincipalDashboard(dc: DataConnect, vars: GetPrincipalDashboardVariables, options?: useDataConnectQueryOptions<GetPrincipalDashboardData>): UseDataConnectQueryResult<GetPrincipalDashboardData, GetPrincipalDashboardVariables>;

export function useGetStudentsByWing(vars: GetStudentsByWingVariables, options?: useDataConnectQueryOptions<GetStudentsByWingData>): UseDataConnectQueryResult<GetStudentsByWingData, GetStudentsByWingVariables>;
export function useGetStudentsByWing(dc: DataConnect, vars: GetStudentsByWingVariables, options?: useDataConnectQueryOptions<GetStudentsByWingData>): UseDataConnectQueryResult<GetStudentsByWingData, GetStudentsByWingVariables>;

export function useGetCoordinatorStudentsByWing(vars: GetCoordinatorStudentsByWingVariables, options?: useDataConnectQueryOptions<GetCoordinatorStudentsByWingData>): UseDataConnectQueryResult<GetCoordinatorStudentsByWingData, GetCoordinatorStudentsByWingVariables>;
export function useGetCoordinatorStudentsByWing(dc: DataConnect, vars: GetCoordinatorStudentsByWingVariables, options?: useDataConnectQueryOptions<GetCoordinatorStudentsByWingData>): UseDataConnectQueryResult<GetCoordinatorStudentsByWingData, GetCoordinatorStudentsByWingVariables>;

export function useGetPromotionHistory(vars?: GetPromotionHistoryVariables, options?: useDataConnectQueryOptions<GetPromotionHistoryData>): UseDataConnectQueryResult<GetPromotionHistoryData, GetPromotionHistoryVariables>;
export function useGetPromotionHistory(dc: DataConnect, vars?: GetPromotionHistoryVariables, options?: useDataConnectQueryOptions<GetPromotionHistoryData>): UseDataConnectQueryResult<GetPromotionHistoryData, GetPromotionHistoryVariables>;

export function useGetStudentSequence(vars: GetStudentSequenceVariables, options?: useDataConnectQueryOptions<GetStudentSequenceData>): UseDataConnectQueryResult<GetStudentSequenceData, GetStudentSequenceVariables>;
export function useGetStudentSequence(dc: DataConnect, vars: GetStudentSequenceVariables, options?: useDataConnectQueryOptions<GetStudentSequenceData>): UseDataConnectQueryResult<GetStudentSequenceData, GetStudentSequenceVariables>;

export function useGenerateAdmissionNumber(vars: GenerateAdmissionNumberVariables, options?: useDataConnectQueryOptions<GenerateAdmissionNumberData>): UseDataConnectQueryResult<GenerateAdmissionNumberData, GenerateAdmissionNumberVariables>;
export function useGenerateAdmissionNumber(dc: DataConnect, vars: GenerateAdmissionNumberVariables, options?: useDataConnectQueryOptions<GenerateAdmissionNumberData>): UseDataConnectQueryResult<GenerateAdmissionNumberData, GenerateAdmissionNumberVariables>;

export function useGetLastStudentSerial(vars: GetLastStudentSerialVariables, options?: useDataConnectQueryOptions<GetLastStudentSerialData>): UseDataConnectQueryResult<GetLastStudentSerialData, GetLastStudentSerialVariables>;
export function useGetLastStudentSerial(dc: DataConnect, vars: GetLastStudentSerialVariables, options?: useDataConnectQueryOptions<GetLastStudentSerialData>): UseDataConnectQueryResult<GetLastStudentSerialData, GetLastStudentSerialVariables>;

export function useGetTeachers(vars: GetTeachersVariables, options?: useDataConnectQueryOptions<GetTeachersData>): UseDataConnectQueryResult<GetTeachersData, GetTeachersVariables>;
export function useGetTeachers(dc: DataConnect, vars: GetTeachersVariables, options?: useDataConnectQueryOptions<GetTeachersData>): UseDataConnectQueryResult<GetTeachersData, GetTeachersVariables>;

export function useGetTeachersByBranch(vars: GetTeachersByBranchVariables, options?: useDataConnectQueryOptions<GetTeachersByBranchData>): UseDataConnectQueryResult<GetTeachersByBranchData, GetTeachersByBranchVariables>;
export function useGetTeachersByBranch(dc: DataConnect, vars: GetTeachersByBranchVariables, options?: useDataConnectQueryOptions<GetTeachersByBranchData>): UseDataConnectQueryResult<GetTeachersByBranchData, GetTeachersByBranchVariables>;

export function useGetTeachersByWing(vars: GetTeachersByWingVariables, options?: useDataConnectQueryOptions<GetTeachersByWingData>): UseDataConnectQueryResult<GetTeachersByWingData, GetTeachersByWingVariables>;
export function useGetTeachersByWing(dc: DataConnect, vars: GetTeachersByWingVariables, options?: useDataConnectQueryOptions<GetTeachersByWingData>): UseDataConnectQueryResult<GetTeachersByWingData, GetTeachersByWingVariables>;

export function useGetCoordinatorTeachersByWing(vars: GetCoordinatorTeachersByWingVariables, options?: useDataConnectQueryOptions<GetCoordinatorTeachersByWingData>): UseDataConnectQueryResult<GetCoordinatorTeachersByWingData, GetCoordinatorTeachersByWingVariables>;
export function useGetCoordinatorTeachersByWing(dc: DataConnect, vars: GetCoordinatorTeachersByWingVariables, options?: useDataConnectQueryOptions<GetCoordinatorTeachersByWingData>): UseDataConnectQueryResult<GetCoordinatorTeachersByWingData, GetCoordinatorTeachersByWingVariables>;

export function useGetTeacherProfile(vars: GetTeacherProfileVariables, options?: useDataConnectQueryOptions<GetTeacherProfileData>): UseDataConnectQueryResult<GetTeacherProfileData, GetTeacherProfileVariables>;
export function useGetTeacherProfile(dc: DataConnect, vars: GetTeacherProfileVariables, options?: useDataConnectQueryOptions<GetTeacherProfileData>): UseDataConnectQueryResult<GetTeacherProfileData, GetTeacherProfileVariables>;

export function useGetTeacherProfileByUser(vars: GetTeacherProfileByUserVariables, options?: useDataConnectQueryOptions<GetTeacherProfileByUserData>): UseDataConnectQueryResult<GetTeacherProfileByUserData, GetTeacherProfileByUserVariables>;
export function useGetTeacherProfileByUser(dc: DataConnect, vars: GetTeacherProfileByUserVariables, options?: useDataConnectQueryOptions<GetTeacherProfileByUserData>): UseDataConnectQueryResult<GetTeacherProfileByUserData, GetTeacherProfileByUserVariables>;

export function useGetTeacherDashboard(vars: GetTeacherDashboardVariables, options?: useDataConnectQueryOptions<GetTeacherDashboardData>): UseDataConnectQueryResult<GetTeacherDashboardData, GetTeacherDashboardVariables>;
export function useGetTeacherDashboard(dc: DataConnect, vars: GetTeacherDashboardVariables, options?: useDataConnectQueryOptions<GetTeacherDashboardData>): UseDataConnectQueryResult<GetTeacherDashboardData, GetTeacherDashboardVariables>;

export function useGetSubjects(vars?: GetSubjectsVariables, options?: useDataConnectQueryOptions<GetSubjectsData>): UseDataConnectQueryResult<GetSubjectsData, GetSubjectsVariables>;
export function useGetSubjects(dc: DataConnect, vars?: GetSubjectsVariables, options?: useDataConnectQueryOptions<GetSubjectsData>): UseDataConnectQueryResult<GetSubjectsData, GetSubjectsVariables>;

export function useGetSectionsForTeacherAssignment(vars: GetSectionsForTeacherAssignmentVariables, options?: useDataConnectQueryOptions<GetSectionsForTeacherAssignmentData>): UseDataConnectQueryResult<GetSectionsForTeacherAssignmentData, GetSectionsForTeacherAssignmentVariables>;
export function useGetSectionsForTeacherAssignment(dc: DataConnect, vars: GetSectionsForTeacherAssignmentVariables, options?: useDataConnectQueryOptions<GetSectionsForTeacherAssignmentData>): UseDataConnectQueryResult<GetSectionsForTeacherAssignmentData, GetSectionsForTeacherAssignmentVariables>;

export function useGetAccountants(vars: GetAccountantsVariables, options?: useDataConnectQueryOptions<GetAccountantsData>): UseDataConnectQueryResult<GetAccountantsData, GetAccountantsVariables>;
export function useGetAccountants(dc: DataConnect, vars: GetAccountantsVariables, options?: useDataConnectQueryOptions<GetAccountantsData>): UseDataConnectQueryResult<GetAccountantsData, GetAccountantsVariables>;

export function useGetAccountantProfile(vars: GetAccountantProfileVariables, options?: useDataConnectQueryOptions<GetAccountantProfileData>): UseDataConnectQueryResult<GetAccountantProfileData, GetAccountantProfileVariables>;
export function useGetAccountantProfile(dc: DataConnect, vars: GetAccountantProfileVariables, options?: useDataConnectQueryOptions<GetAccountantProfileData>): UseDataConnectQueryResult<GetAccountantProfileData, GetAccountantProfileVariables>;

export function useGetAccountantByUser(vars: GetAccountantByUserVariables, options?: useDataConnectQueryOptions<GetAccountantByUserData>): UseDataConnectQueryResult<GetAccountantByUserData, GetAccountantByUserVariables>;
export function useGetAccountantByUser(dc: DataConnect, vars: GetAccountantByUserVariables, options?: useDataConnectQueryOptions<GetAccountantByUserData>): UseDataConnectQueryResult<GetAccountantByUserData, GetAccountantByUserVariables>;

export function useGetFeeCategories(vars?: GetFeeCategoriesVariables, options?: useDataConnectQueryOptions<GetFeeCategoriesData>): UseDataConnectQueryResult<GetFeeCategoriesData, GetFeeCategoriesVariables>;
export function useGetFeeCategories(dc: DataConnect, vars?: GetFeeCategoriesVariables, options?: useDataConnectQueryOptions<GetFeeCategoriesData>): UseDataConnectQueryResult<GetFeeCategoriesData, GetFeeCategoriesVariables>;

export function useGetClassTeacherAssignments(vars: GetClassTeacherAssignmentsVariables, options?: useDataConnectQueryOptions<GetClassTeacherAssignmentsData>): UseDataConnectQueryResult<GetClassTeacherAssignmentsData, GetClassTeacherAssignmentsVariables>;
export function useGetClassTeacherAssignments(dc: DataConnect, vars: GetClassTeacherAssignmentsVariables, options?: useDataConnectQueryOptions<GetClassTeacherAssignmentsData>): UseDataConnectQueryResult<GetClassTeacherAssignmentsData, GetClassTeacherAssignmentsVariables>;

export function useGetClassFees(vars: GetClassFeesVariables, options?: useDataConnectQueryOptions<GetClassFeesData>): UseDataConnectQueryResult<GetClassFeesData, GetClassFeesVariables>;
export function useGetClassFees(dc: DataConnect, vars: GetClassFeesVariables, options?: useDataConnectQueryOptions<GetClassFeesData>): UseDataConnectQueryResult<GetClassFeesData, GetClassFeesVariables>;

export function useGetStudentFeeProfile(vars: GetStudentFeeProfileVariables, options?: useDataConnectQueryOptions<GetStudentFeeProfileData>): UseDataConnectQueryResult<GetStudentFeeProfileData, GetStudentFeeProfileVariables>;
export function useGetStudentFeeProfile(dc: DataConnect, vars: GetStudentFeeProfileVariables, options?: useDataConnectQueryOptions<GetStudentFeeProfileData>): UseDataConnectQueryResult<GetStudentFeeProfileData, GetStudentFeeProfileVariables>;

export function useGetPaymentHistory(vars: GetPaymentHistoryVariables, options?: useDataConnectQueryOptions<GetPaymentHistoryData>): UseDataConnectQueryResult<GetPaymentHistoryData, GetPaymentHistoryVariables>;
export function useGetPaymentHistory(dc: DataConnect, vars: GetPaymentHistoryVariables, options?: useDataConnectQueryOptions<GetPaymentHistoryData>): UseDataConnectQueryResult<GetPaymentHistoryData, GetPaymentHistoryVariables>;

export function useGetReceiptSequence(vars: GetReceiptSequenceVariables, options?: useDataConnectQueryOptions<GetReceiptSequenceData>): UseDataConnectQueryResult<GetReceiptSequenceData, GetReceiptSequenceVariables>;
export function useGetReceiptSequence(dc: DataConnect, vars: GetReceiptSequenceVariables, options?: useDataConnectQueryOptions<GetReceiptSequenceData>): UseDataConnectQueryResult<GetReceiptSequenceData, GetReceiptSequenceVariables>;

export function useGetFeeReports(vars: GetFeeReportsVariables, options?: useDataConnectQueryOptions<GetFeeReportsData>): UseDataConnectQueryResult<GetFeeReportsData, GetFeeReportsVariables>;
export function useGetFeeReports(dc: DataConnect, vars: GetFeeReportsVariables, options?: useDataConnectQueryOptions<GetFeeReportsData>): UseDataConnectQueryResult<GetFeeReportsData, GetFeeReportsVariables>;

export function useGetGlobalStudentExplorer(vars?: GetGlobalStudentExplorerVariables, options?: useDataConnectQueryOptions<GetGlobalStudentExplorerData>): UseDataConnectQueryResult<GetGlobalStudentExplorerData, GetGlobalStudentExplorerVariables>;
export function useGetGlobalStudentExplorer(dc: DataConnect, vars?: GetGlobalStudentExplorerVariables, options?: useDataConnectQueryOptions<GetGlobalStudentExplorerData>): UseDataConnectQueryResult<GetGlobalStudentExplorerData, GetGlobalStudentExplorerVariables>;

export function useGetGlobalReports(options?: useDataConnectQueryOptions<GetGlobalReportsData>): UseDataConnectQueryResult<GetGlobalReportsData, undefined>;
export function useGetGlobalReports(dc: DataConnect, options?: useDataConnectQueryOptions<GetGlobalReportsData>): UseDataConnectQueryResult<GetGlobalReportsData, undefined>;

export function useGetAuditLogs(vars?: GetAuditLogsVariables, options?: useDataConnectQueryOptions<GetAuditLogsData>): UseDataConnectQueryResult<GetAuditLogsData, GetAuditLogsVariables>;
export function useGetAuditLogs(dc: DataConnect, vars?: GetAuditLogsVariables, options?: useDataConnectQueryOptions<GetAuditLogsData>): UseDataConnectQueryResult<GetAuditLogsData, GetAuditLogsVariables>;
