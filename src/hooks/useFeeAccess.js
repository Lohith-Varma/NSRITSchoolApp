import {useMemo} from 'react';
import {useSelector} from 'react-redux';

export const useFeeAccess = () => {
  const user = useSelector(state => state.auth.user);
  const role = useSelector(state => state.auth.role);

  return useMemo(
    () => ({
      role: role || user?.role,
      branchId: user?.branchId,
      branchCode: user?.branchCode,
      userId: user?.id,
      accountantId: user?.accountantId,
      parentId: user?.parentId || user?.id,
      wingId: user?.wingId,
      wing: user?.wing,
      sectionId: user?.sectionId,
      sectionName: user?.sectionName || 'A',
    }),
    [role, user],
  );
};

export default useFeeAccess;
