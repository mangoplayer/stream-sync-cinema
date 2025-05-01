
// Authentication types
export interface LoginCredentials {
  server: string;
  username: string;
  password: string;
}

export interface UserSession {
  user_info: UserInfo;
  server_info: ServerInfo;
  token: string;
}

export interface UserInfo {
  username: string;
  password: string;
  message: string;
  auth: number;
  status: string;
  exp_date: string;
  is_trial: number;
  active_cons: number;
  max_connections: number;
  created_at: string;
  allowed_output_formats: string[];
}

export interface ServerInfo {
  url: string;
  port: string;
  https_port: string;
  server_protocol: string;
  rtmp_port: string;
  timezone: string;
  timestamp_now: number;
  time_now: string;
}

// Content types
export interface Category {
  category_id: string;
  category_name: string;
  parent_id: number;
}

export interface LiveChannel {
  stream_id: number;
  name: string;
  stream_type: string;
  stream_icon: string;
  epg_channel_id: string;
  added: string;
  category_id: string;
  custom_sid: string;
  tv_archive: number;
  direct_source: string;
  tv_archive_duration: number;
}

export interface Movie {
  stream_id: number;
  name: string;
  added: string;
  category_id: string;
  container_extension: string;
  stream_type: string;
  stream_icon: string;
  rating: string;
  director: string;
  actors: string;
  genre: string;
  releaseDate: string;
  plot: string;
  duration: string;
}

export interface Series {
  series_id: number;
  name: string;
  cover: string;
  genre: string;
  plot: string;
  cast: string;
  director: string;
  releaseDate: string;
  last_modified: string;
  rating: string;
  rating_5based: number;
  backdrop_path: string[];
}

export interface Season {
  id: string;
  season_number: number;
  name: string;
  cover: string;
}

export interface Episode {
  id: string;
  episode_num: number;
  title: string;
  container_extension: string;
  info: {
    movie_image: string;
    plot: string;
    releasedate: string;
    duration: string;
  };
}

// EPG types
export interface EPGProgram {
  id: string;
  start: string; // ISO date string
  stop: string; // ISO date string
  title: string;
  description: string;
  channel: string;
  category: string;
}

export interface EPGChannel {
  id: string;
  name: string;
  icon: string;
  programs: EPGProgram[];
}
