export const idlFactory = ({ IDL }) => {
  const PostId = IDL.Nat;
  const PostId__1 = IDL.Nat;
  const Comment = IDL.Record({
    'content' : IDL.Text,
    'author' : IDL.Principal,
    'timestamp' : IDL.Int,
  });
  const Post = IDL.Record({
    'id' : PostId__1,
    'content' : IDL.Text,
    'user_likes' : IDL.Vec(IDL.Principal),
    'author' : IDL.Principal,
    'likes' : IDL.Nat,
    'timestamp' : IDL.Int,
    'comments' : IDL.Vec(Comment),
  });
  const Error = IDL.Variant({
    'InvalidInput' : IDL.Null,
    'AlreadyLiked' : IDL.Null,
    'SystemError' : IDL.Null,
    'NotFound' : IDL.Null,
    'NotAuthorized' : IDL.Null,
    'NotLiked' : IDL.Null,
  });
  const PostResult = IDL.Variant({ 'ok' : Post, 'err' : Error });
  const Post__1 = IDL.Record({
    'id' : PostId__1,
    'content' : IDL.Text,
    'user_likes' : IDL.Vec(IDL.Principal),
    'author' : IDL.Principal,
    'likes' : IDL.Nat,
    'timestamp' : IDL.Int,
    'comments' : IDL.Vec(Comment),
  });
  const SocialMediaDapp = IDL.Service({
    'addComment' : IDL.Func([PostId, IDL.Text], [PostResult], []),
    'createPost' : IDL.Func([IDL.Text], [PostResult], []),
    'getAllPosts' : IDL.Func([], [IDL.Vec(Post__1)], ['query']),
    'getPost' : IDL.Func([PostId], [PostResult], ['query']),
    'likePost' : IDL.Func([PostId], [PostResult], []),
    'unlikePost' : IDL.Func([PostId], [PostResult], []),
  });
  return SocialMediaDapp;
};
export const init = ({ IDL }) => { return []; };
