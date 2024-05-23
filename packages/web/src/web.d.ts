type Id = string;
type InstanceId = Id;
type Title = string;
type Name = string;
type Type = string;

type Index = number;
type Rate = number;
type Value = number;
type Version = number;
type Second = number;

type OneTime = boolean;

type Subscriber<T> = (payload: T) => void;
