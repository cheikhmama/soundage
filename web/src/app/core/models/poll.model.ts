/** Question type matching backend enum */
export type QuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'image_choice'
  | 'rating'
  | 'text'
  | 'yes_no'
  | 'ranking';

/** Option type matching backend enum */
export type OptionType = 'TEXT' | 'IMAGE' | 'NUMERIC';

export interface PollDto {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
  createdById?: string;
  createdAt?: string;
  updatedAt?: string;
  allowAnonymous?: boolean;
}

export interface OptionDto {
  id: string;
  type: OptionType;
  textContent?: string;
  imageUrl?: string;
  numericValue?: number;
  sortOrder?: number;
  weight?: number;
}

export interface QuestionDto {
  id: string;
  type: QuestionType;
  title: string;
  isRequired?: boolean;
  allowMultiple?: boolean;
  sortOrder?: number;
  settings?: Record<string, unknown>;
  options?: OptionDto[];
}

export interface PollDetailDto extends PollDto {
  settings?: Record<string, unknown>;
  questions?: QuestionDto[];
  /** True if the current user (or anonymous id) has already voted in this poll. */
  hasVoted?: boolean;
}

export interface CreateOptionRequest {
  type: OptionType;
  textContent?: string;
  imageUrl?: string;
  numericValue?: number;
  sortOrder?: number;
  weight?: number;
}

export interface CreateQuestionRequest {
  type: QuestionType;
  title: string;
  isRequired?: boolean;
  allowMultiple?: boolean;
  sortOrder?: number;
  settings?: Record<string, unknown>;
  options?: CreateOptionRequest[];
}

export interface CreatePollRequest {
  title: string;
  description?: string;
  isActive?: boolean;
  startsAt?: string;
  endsAt?: string;
  allowAnonymous?: boolean;
  settings?: Record<string, unknown>;
  questions?: CreateQuestionRequest[];
}

export interface UpdatePollRequest {
  title?: string;
  description?: string;
  isActive?: boolean;
  startsAt?: string;
  endsAt?: string;
  allowAnonymous?: boolean;
  settings?: Record<string, unknown>;
  questions?: CreateQuestionRequest[];
}

export interface RankingEntryDto {
  optionId: string;
  position: number;
}

export interface AnswerInputDto {
  questionId: string;
  optionId?: string;
  optionIds?: string[];
  textValue?: string;
  numericValue?: number;
  ranking?: RankingEntryDto[];
}

export interface SubmitVoteRequest {
  anonymousId?: string;
  answers: AnswerInputDto[];
}

export interface SubmitVoteResponse {
  responseId: string;
  message: string;
}

/** Results / stats for one option in choice questions */
export interface OptionCountDto {
  optionId: string;
  optionLabel: string;
  imageUrl?: string;
  count: number;
  percentage: number;
}

/** Rating distribution bucket (1-5) */
export interface RatingBucketDto {
  value: number;
  count: number;
  percentage: number;
}

/** One text/comment response with voter info */
export interface TextResponseEntryDto {
  displayName: string;
  email: string | null;
  anonymous: boolean;
  text: string;
}

/** Results for one question */
export interface QuestionResultDto {
  questionId: string;
  questionTitle: string;
  type: string;
  optionCounts?: OptionCountDto[];
  ratingDistribution?: RatingBucketDto[];
  averageRating?: number;
  textResponses?: string[];
  textResponseEntries?: TextResponseEntryDto[];
}

/** Voter info for results (name, email or Anonymous) */
export interface VoterInfoDto {
  displayName: string;
  email: string | null;
  anonymous: boolean;
}

/** Full poll results for stats/charts */
export interface PollResultsDto {
  pollId: string;
  pollTitle: string;
  totalResponses: number;
  questionResults: QuestionResultDto[];
  voters?: VoterInfoDto[];
}
