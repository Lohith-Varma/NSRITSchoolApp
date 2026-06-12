import academicRepository from '../../repositories/academicRepository';
import {assertBranchAccess} from '../academics/academicAccess';

export const principalDashboardService = {
  async getDashboard(branchId, scope) {
    assertBranchAccess(scope, branchId);
    const response = await academicRepository.getPrincipalDashboard(branchId);

    const pendingPromotions = (response.pendingPromotions || []).filter(
      student => student.academicClass?.name !== '12',
    );

    return {
      totalStudents: response.students?.length || 0,
      totalTeachers: response.teachers?.length || 0,
      totalCoordinators: response.coordinators?.length || 0,
      totalSections: response.sections?.length || 0,
      pendingPromotions: pendingPromotions.length,
    };
  },
};

export default principalDashboardService;
