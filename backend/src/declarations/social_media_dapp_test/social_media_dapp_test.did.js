export const idlFactory = ({ IDL }) => {
  const UserManagerTests = IDL.Service({
    'getCycleBalance' : IDL.Func([], [IDL.Nat], ['query']),
    'initialize' : IDL.Func([], [], []),
    'runAllTests' : IDL.Func([], [IDL.Bool], []),
    'testFollowUnfollow' : IDL.Func([], [IDL.Bool], []),
    'testProfileUpdate' : IDL.Func([], [IDL.Bool], []),
    'testUserRegistration' : IDL.Func([], [IDL.Bool], []),
  });
  return UserManagerTests;
};
export const init = ({ IDL }) => { return []; };
