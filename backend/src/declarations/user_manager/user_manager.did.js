export const idlFactory = ({ IDL }) => {
  const UserId__1 = IDL.Principal;
  const UserId = IDL.Principal;
  const UserProfile = IDL.Record({
    'id' : UserId,
    'bio' : IDL.Opt(IDL.Text),
    'username' : IDL.Text,
    'joinDate' : IDL.Int,
    'followers' : IDL.Vec(UserId),
    'following' : IDL.Vec(UserId),
    'profilePic' : IDL.Opt(IDL.Text),
  });
  const Error = IDL.Variant({
    'InvalidInput' : IDL.Null,
    'SystemError' : IDL.Null,
    'NotFound' : IDL.Null,
    'NotAuthorized' : IDL.Null,
  });
  const Result = IDL.Variant({ 'ok' : UserProfile, 'err' : Error });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Vec(UserProfile), 'err' : Error });
  const UserManager = IDL.Service({
    'followUser' : IDL.Func([UserId__1], [Result], []),
    'getFollowers' : IDL.Func([UserId__1], [Result_1], ['query']),
    'getFollowing' : IDL.Func([UserId__1], [Result_1], ['query']),
    'getProfile' : IDL.Func([UserId__1], [Result], ['query']),
    'registerUser' : IDL.Func([UserProfile], [Result], []),
    'unfollowUser' : IDL.Func([UserId__1], [Result], []),
    'updateProfile' : IDL.Func(
        [IDL.Text, IDL.Opt(IDL.Text), IDL.Opt(IDL.Text)],
        [Result],
        [],
      ),
  });
  return UserManager;
};
export const init = ({ IDL }) => { return []; };
