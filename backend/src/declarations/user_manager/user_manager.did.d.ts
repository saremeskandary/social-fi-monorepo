import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Error = { 'InvalidInput' : null } |
  { 'SystemError' : null } |
  { 'NotFound' : null } |
  { 'NotAuthorized' : null };
export type Result = { 'ok' : UserProfile } |
  { 'err' : Error };
export type Result_1 = { 'ok' : Array<UserProfile> } |
  { 'err' : Error };
export type UserId = Principal;
export type UserId__1 = Principal;
export interface UserManager {
  'followUser' : ActorMethod<[UserId__1], Result>,
  'getFollowers' : ActorMethod<[UserId__1], Result_1>,
  'getFollowing' : ActorMethod<[UserId__1], Result_1>,
  'getProfile' : ActorMethod<[UserId__1], Result>,
  'registerUser' : ActorMethod<[UserProfile], Result>,
  'unfollowUser' : ActorMethod<[UserId__1], Result>,
  'updateProfile' : ActorMethod<[string, [] | [string], [] | [string]], Result>,
}
export interface UserProfile {
  'id' : UserId,
  'bio' : [] | [string],
  'username' : string,
  'joinDate' : bigint,
  'followers' : Array<UserId>,
  'following' : Array<UserId>,
  'profilePic' : [] | [string],
}
export interface _SERVICE extends UserManager {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
