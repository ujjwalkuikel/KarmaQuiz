import { Devvit, useAsync, useState } from '@devvit/public-api';
import { Post } from '@devvit/public-api';
Devvit.configure({
  redditAPI: true,
  redis: true,
  http: true,
});


Devvit.addSchedulerJob({
  name: 'update_questions',
  onRun: async (_, context) => {
    const subreddits = ['AskReddit', 'AmItheAsshole', 'unpopularopinion', 'relationshipadvice']; 
    try {
      for (const subName of subreddits) {
        const topPosts = await context.reddit.getTopPosts({
          subredditName: subName,
          timeframe: 'day',
          limit: 4, 
        }).all();
        if (topPosts.length === 4) {
          const questionId = 1;
          const question = {
            text: "Which of these posts has the highest number of upvotes in the last 24 hours?",
            options: topPosts.map(post => post.title),
            correctAnswer: topPosts[0].title,
          };
          const redisKey = `quiz:${subName}::${questionId}`;
          await context.redis.set(redisKey, JSON.stringify(question));
        }
        const topPostsweek = await context.reddit.getTopPosts({
          subredditName: subName,
          timeframe: 'week',
          limit: 4, 
        }).all();
        
        if (topPostsweek.length === 4) {
          const questionId = 2;
          const question = {
            text: "Which of these posts has the highest number of upvotes in the last week?",
            options: topPostsweek.map(post => post.title),
            correctAnswer: topPostsweek[0].title,
          };
          const redisKey = `quiz:${subName}::${questionId}`;
          await context.redis.set(redisKey, JSON.stringify(question));
        }

        const controversialPosts = await context.reddit.getControversialPosts({
          subredditName: subName,
          timeframe: 'day',
          limit: 4, 
        }).all();
      
        if (controversialPosts.length === 4) {
          const questionId = 3;
          const question = {
            text: "Which of these posts was most controversial in the last 24 hours?",
            options: controversialPosts.map(post => post.title),
            correctAnswer: controversialPosts[0].title,
          };
          const redisKey = `quiz:${subName}::${questionId}`;
          await context.redis.set(redisKey, JSON.stringify(question));
        }
        //4
        const controversialPostsweek = await context.reddit.getControversialPosts({
          subredditName: subName,
          timeframe: 'week',
          limit: 4, 
        }).all();
      
        if (controversialPostsweek.length === 4) {
          const questionId = 4;
          const question = {
            text: "Which of these posts was most controversial in the last 24 hours?",
            options: controversialPostsweek.map(post => post.title),
            correctAnswer: controversialPostsweek[0].title,
          };
          const redisKey = `quiz:${subName}::${questionId}`;
          await context.redis.set(redisKey, JSON.stringify(question));
        }

        async function createQuizQuestion(post:Post, questionId:number, sortType:'top'|'controversial') {
          const comments = await context.reddit.getComments({
            postId: post.id,
            limit: 10,
            sort: sortType,
          }).all();
          const allComments = comments.filter(comment => 
            !comment.distinguishedBy && // Not a pinned comment
            comment.authorName !== 'AutoModerator' && // Not from AutoModerator
            !comment.body.includes('Welcome to r/AmITheAsshole') && // Not the specific welcome message
            !comment.isRemoved() // Not removed by mods
          );
          const commentsSorted = allComments.slice(0, 4); // Limit to 4 comments for the quiz
          if (commentsSorted.length === 4) {
            const question = {
              text: `Which of these comments was ${sortType === 'top' ? 'top rated' : 'most controversial'} in post titled: ${post.title}`,
              options: commentsSorted.map(comment => 
                ((comment.body).length) > 100 ? comment.body.substring(0, 100)+'...' : comment.body
              ),
              correctAnswer: ((commentsSorted[0].body).length) > 100 
               ? commentsSorted[0].body.substring(0, 100)+'...'
               : commentsSorted[0].body,
            };
            const redisKey = `quiz:${subName}::${questionId}`;
            await context.redis.set(redisKey, JSON.stringify(question));
          }
        }
        async function createCommentApproximationQuestion(post:Post, questionId:number) {
          const commentCount = post.numberOfComments; // Assuming this data is available directly from the post object
          const roundedCount = Math.round(commentCount / 10) * 10; // Round to nearest 10 for approximation
        
          const question = {
            text: `How many comments are there in the post titled: "${post.title}" ?`,
            options: [
              'Around '+(roundedCount - 50).toString(),  // One range below
              'Around '+roundedCount.toString(),         // Approximate count
              'Around '+(roundedCount + 50).toString(),  // One range above
              'Around '+(roundedCount + 100).toString(),  // Two ranges above
            ], 
            correctAnswer: 'Around '+roundedCount.toString(),
          };
        
          const redisKey = `quiz:${subName}::${questionId}`;
          await context.redis.set(redisKey, JSON.stringify(question));
        }
        
        async function createUpvotesQuestion(post:Post, questionId:number) {
          const upvotes = post.score;  // Assuming this is the property for upvotes
          const roundedupvotes = Math.round(upvotes / 100) * 100;
          const question = {
            text: `How many upvotes does the post titled: "${post.title}" have?`,
            options: [
              'Around '+(roundedupvotes - 100).toString(),  // 100 less than actual
              'Around '+roundedupvotes.toString(),          // Correct upvotes
              'Around '+(roundedupvotes + 100).toString(),  // 100 more than actual
              'Around '+(roundedupvotes + 200).toString(),  // 200 more than actual
            ],
            correctAnswer: 'Around '+roundedupvotes.toString(),
          };
        
          const redisKey = `quiz:${subName}::${questionId}`;
          await context.redis.set(redisKey, JSON.stringify(question));
        }
        const postsForComments = await context.reddit.getTopPosts({
          subredditName: subName,
          timeframe: 'week',
          limit: 30, // Fetch 30 posts to ensure we have enough data
        }).all();
        
        for (let i = 5; i < 15; i++) {
          const randomPost = postsForComments[Math.floor(Math.random() * 30)];
          const questionId = i;  // Assign question IDs
          const sortType = i % 2 === 0 ? 'top' : 'controversial';  // Toggle between top and controversial
          console.log('in 1 func',randomPost, questionId, sortType);
          console.log('createQuizQuestion',randomPost.id, questionId, sortType);
          await createQuizQuestion(randomPost, questionId, sortType);
        }

        for (let i = 15; i < 17; i++) {
          const randomPostForCommentCount = postsForComments[Math.floor(Math.random() * 30)];
          const commentCountQuestionId = i;  
          await createCommentApproximationQuestion(randomPostForCommentCount, commentCountQuestionId);
        }

        // Add the number of upvotes question
        for (let i = 17; i < 20; i++) {
          const randomPostForUpvotes = postsForComments[Math.floor(Math.random() * 30)];
          const upvotesQuestionId = i ;  
          await createUpvotesQuestion(randomPostForUpvotes, upvotesQuestionId);
      }
      }

      const normalTriviaJSON = 'https://opentdb.com/api.php?amount=50&type=multiple';
      const response = await fetch(normalTriviaJSON);
      const data = await response.json();
      const triviaQuestions = data.results;
      
      // 5. Trivia Questions
      interface TriviaQuestion {
        question: string;
        incorrect_answers: string[];
        correct_answer: string;
      }

      interface QuizQuestion {
        text: string;
        options: string[];
        correctAnswer: string;
      }

      triviaQuestions.forEach(async (triviaQuestion: TriviaQuestion, index: number) => {
        const triviaQuestionId: string = `quiz:trivia::${index + 1}`;
        const question: QuizQuestion = {
          text: triviaQuestion.question,
          options: [...triviaQuestion.incorrect_answers, triviaQuestion.correct_answer],
          correctAnswer: triviaQuestion.correct_answer,
        };
        const redisKey: string = triviaQuestionId;
        console.log('triviaQuestion:', question);
        console.log('redisKey:', redisKey);
        await context.redis.set(redisKey, JSON.stringify(question));
      });
      


      interface EmojiQuestion {
        text: string;
        options: string[];
        correctAnswer: string;
      }

      const emojiQuestions: EmojiQuestion[] = [
        {
          text: "🌍📰🗞️ What subreddit is this?",
          options: ["r/weather", "r/internationalnews", "r/news"],
          correctAnswer: "r/worldnews"
        },
        {
          text: "🎬🍿🎥 What do users typically discuss?",
          options: ["Film production techniques", "Actor biographies", "Cinema history"],
          correctAnswer: "Movie reviews and discussions"
        },
        {
          text: "🤔👶📖 What is the core purpose?",
          options: ["r/children", "r/parentingadvice", "r/thoughts"],
          correctAnswer: "r/explainlikeimfive"
        },
        {
          text: "💑💔🤝 What is the main purpose of this subreddit?",
          options: ["r/dating", "r/breakup", "r/divorce"],
          correctAnswer: "r/relationship_advice"
        },
        {
          text: "🌍✈️🏖️ What is the primary content?",
          options: ["Travel agency advertisements", "Flight booking tips", "Tourism industry news"],
          correctAnswer: "Travel experiences and destination recommendations"
        },
        {
          text: "🚢💔 Which movie is this?",
          options: ["The Poseidon Adventure", "Captain Phillips", "Moby Dick"],
          correctAnswer: "Titanic"
        },
        {
          text: "🧙‍♂️⚡ Which movie is this?",
          options: ["The Hobbit", "Percy Jackson", "The Lord of the Rings"],
          correctAnswer: "Harry Potter"
        },
        {
          text: "🦁👑 Which movie is this?",
          options: ["Madagascar", "The Jungle Book", "Tarzan"],
          correctAnswer: "The Lion King"
        },
        {
          text: "🧟‍♂️🔫 Which movie is this?",
          options: ["Resident Evil", "28 Days Later", "The Walking Dead"],
          correctAnswer: "World War Z"
        },
        {
          text: "⚔️👑 Which show is this?",
          options: ["Gladiator", "Braveheart", "King Arthur"],
          correctAnswer: "Game of Thrones"
        },
        {
          text: "🦖🦕 Which movie is this?",
          options: ["Jurassic World", "The Lost World", "Land of the Lost"],
          correctAnswer: "Jurassic Park"
        },
        {
          text: "🎩🐰 Which movie is this?",
          options: ["The Wizard of Oz", "Charlie and the Chocolate Factory", "Oz the Great and Powerful"],
          correctAnswer: "Alice in Wonderland"
        },
        {
          text: "👸🏻❄️ Which movie is this?",
          options: ["The Snow Queen", "Tangled", "Brave"],
          correctAnswer: "Frozen"
        },
        {
          text: "🚗💨 Which movie is this?",
          options: ["Need for Speed", "Rush", "Cars"],
          correctAnswer: "Fast & Furious"
        },
        {
          text: "🧑‍🦳🔎 Which movie is this?",
          options: ["Knives Out", "The Girl with the Dragon Tattoo", "Murder on the Orient Express"],
          correctAnswer: "Sherlock Holmes"
        },
        {
          text: "👨‍🚀🌍 Which movie is this?",
          options: ["The Martian", "Apollo 13", "Gravity"],
          correctAnswer: "Interstellar"
        },
        {
          text: "👑🦁 Which movie is this?",
          options: ["King Kong", "Jungle Book", "The Jungle Book"],
          correctAnswer: "The Lion King"
        },
        {
          text: "🧟‍♂️🔬 Which movie is this?",
          options: ["World War Z", "28 Days Later", "I Am Legend"],
          correctAnswer: "Resident Evil"
        },
        {
          text: "👨‍⚖️📚 Which movie is this?",
          options: ["The Social Network", "12 Angry Men", "The Trial"],
          correctAnswer: "A Few Good Men"
        },
        {
          text: "🦋👨‍🦰 Which movie is this?",
          options: ["Inception", "Eternal Sunshine of the Spotless Mind", "Donnie Darko"],
          correctAnswer: "The Butterfly Effect"
        },
        {
          text: "🧑‍🔬⚡ Which movie is this?",
          options: ["Iron Man", "The Flash", "Fantastic Four"],
          correctAnswer: "Doctor Strange"
        },
        {
          text: "🚁🦖 Which movie is this?",
          options: ["King Kong", "Jurassic World", "The Lost World"],
          correctAnswer: "Jurassic Park"
        },
        {
          text: "🦸‍♂️💪 What popular phrase is this?",
          options: ["Superman is strong", "Power of will", "Born to be a hero "],
          correctAnswer: "Feeling invincible"
        },
        {
          text: "🐝🍯 What popular phrase is this?",
          options: ["Sweet as honey", "Bees and honey", "Honeycomb dreams"],
          correctAnswer: "Busy as a bee"
        },
        {
          text: "🐍🍏 What popular phrase is this?",
          options: ["Don't trust the snake", "Tempting as the apple", "snake in the grass"],
          correctAnswer: "Forbidden fruit"
        },
        {
          text: "🚀🌙 What popular phrase is this?",
          options: ["Out of this world", "Shoot for the stars", "Houston, we have a problem"],
          correctAnswer: "To the moon"
        },
        
        {
          text: "🔥💔 What popular phrase is this?",
          options: ["Fire and ice", "Burning love", "Heart on fire"],
          correctAnswer: "Playing with fire"
        },
        {
          text: "👀💡 What popular phrase is this?",
          options: ["Seeing the light", "A light bulb moment", "Bright idea"],
          correctAnswer: "Eye-opening"
        },
        {
          text: "🎭🕴️ What popular phrase is this?",
          options: ["The mask we wear", "Dressed to impress", "All the world's a stage"],
          correctAnswer: "Living a double life"
        }
      ];

      emojiQuestions.forEach(async (emojiQuestion: EmojiQuestion, index: number) => {
        const emojiQuestionId: string = `quiz:emoji::${index + 1}`;
        const question: QuizQuestion = {
          text: emojiQuestion.text,
          options: [...emojiQuestion.options, emojiQuestion.correctAnswer],
          correctAnswer: emojiQuestion.correctAnswer,
        };
        const redisKey: string = emojiQuestionId;
        await context.redis.set(redisKey, JSON.stringify(question));
      });

     


    } catch (error) {
      console.error('Error updating questions:', error);
    }
  },
});


Devvit.addTrigger({
  event: 'AppInstall',
  onEvent: async (_, context) => {
    try {
      const jobId = await context.scheduler.runJob({
        name: 'update_questions',
        cron: '0 0 * * *', // This will run the job at midnight every day
      });
      await context.redis.set('update_questions_job_id', jobId);
    } catch (e) {
      console.log('Error scheduling question update job:', e);
    }
  },
});



Devvit.addMenuItem({
  label: 'Update Questions Now',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_, context) => {
    try {
      await context.scheduler.runJob({
        name: 'update_questions',
        runAt: new Date(),
      });
      context.ui.showToast('Questions updated successfully!');
    } catch (error) {
      console.error('Error running update_questions job:', error);
      context.ui.showToast('Failed to update questions. Check logs for details.');
    }
  },
});


type PageProps = {
  setPage: (page: string, subName?: string) => void;
  context: any; // Pass the context to the pages
  subName?: string;
  currentUser: string | null;
};

const HomePage: Devvit.BlockComponent<PageProps> = ({ setPage, currentUser, context }) => {
  const backgroundImageUrl = context.assets.getURL('home.jpeg');
  const logo = context.assets.getURL('logo.png');
  return (
    <zstack width="100%" height="100%">
      {backgroundImageUrl && (
        <image
          url={backgroundImageUrl}
          imageWidth="800px"
          imageHeight="457px"
          resizeMode="fill"
        />
      )}
      <vstack
        width="100%"
        height="100%"
        alignment="middle center"
        gap="small"
        backgroundColor="rgba(44, 44, 44, 0.7)"  
      >
        <image  url= {logo} imageWidth="150px" imageHeight="96px" resizeMode='fill'/>
        <vstack gap="small" width="30%">
        <button onPress={() => setPage('category')}>Play SubReddit Quiz</button>
        <button onPress={() => setPage('subreddit', 'trivia')}>Play General Trivia</button>
        <button onPress={() => setPage('subreddit', 'emoji')}>Play Emoji Trivia</button>
        <button onPress={() => setPage('leaderboardcategory')}>Leaderboards</button>
        </vstack>
      </vstack>
    </zstack>
  );
};

const CategoryPage = ({ setPage, currentUser, context }: PageProps) => {
  const category = context.assets.getURL('category.jpeg');

  return (
    <zstack width="100%" height="100%">
        <image
          url={category}
          imageWidth="700px"
          imageHeight="350px"
          resizeMode="fill"
        />
      
    <vstack
      width="100%"
      height="100%"
      alignment="middle center"
      gap="small"
      backgroundColor="rgba(44, 44, 44, 0.7)"   
    >
      <text size="xxlarge" color='white' weight='bold'>Select a subreddit to play quiz on.</text>
      <vstack gap="small">
        <button onPress={() => setPage('subreddit', 'AskReddit')}>r/AskReddit</button>
        <button onPress={() => setPage('subreddit', 'AmItheAsshole')}>r/AmITheAsshole (AITA)</button>
        <button onPress={() => setPage('subreddit', 'unpopularopinion')}>r/UnpopularOpinion</button>
        <button onPress={() => setPage('subreddit', 'relationshipadvice')}>r/relationshipadvice</button>
      </vstack>
      <vstack width="30%" alignment='middle center'>
        <button onPress={() => setPage('KarmaQuiz')}>Back</button>
        </vstack>
    </vstack>
    </zstack>
  );
};

const LeaderboardCategoryPage = ({ setPage, currentUser, context }: PageProps) => {
  const category = context.assets.getURL('category.jpeg');

  return (
    <zstack width="100%" height="100%">
        <image
          url={category}
          imageWidth="700px"
          imageHeight="350px"
          resizeMode="fill"
        />
      
    <vstack
      width="100%"
      height="100%"
      alignment="middle center"
      gap="small"
      backgroundColor="rgba(44, 44, 44, 0.7)"   
    >
      <text size="xxlarge" color='white' weight='bold'>Click a category to view the LeaderBoard</text>
      <vstack gap="small" width="100%">
        <hstack gap="small" alignment='middle center'>
          <vstack width="30%" >
          <button onPress={() => setPage('leaderboard', 'AskReddit')}>r/AskReddit</button>
          </vstack>
          <vstack width="30%">
          <button onPress={() => setPage('leaderboard', 'AmItheAsshole')}>r/AmITheAsshole (AITA)</button>
          </vstack>
        </hstack>
        <hstack gap="small" alignment='middle center'>
          <vstack width="30%" >
          <button onPress={() => setPage('leaderboard', 'unpopularopinion')}>r/UnpopularOpinion</button>
          </vstack>
          <vstack width="30%">
          <button onPress={() => setPage('leaderboard', 'relationshipadvice')}>r/relationshipadvice</button>
          </vstack>
        </hstack>
        <hstack gap="small" alignment='middle center'>
          <vstack width="30%">
          <button onPress={() => setPage('leaderboard', 'trivia')}>General Trivia</button>
          </vstack>
          <vstack width="30%">
          <button onPress={() => setPage('leaderboard', 'emoji')}>Emoji Trivia </button>
          </vstack>
        </hstack>
        <hstack alignment='middle center'>
          <vstack width="20%">
          <button onPress={() => setPage('KarmaQuiz')}>Back</button>
          </vstack>
        </hstack>
      </vstack>
    </vstack>
    </zstack>
  );
};

const Leaderboard = ({ setPage, currentUser, context, subName }: PageProps ) => {
  const leaderboardimg = context.assets.getURL('leaderboard.png');
  // Function to fetch leaderboard data
  const { data: fetchLeaderboard, loading, error } = useAsync(async () => {
    const leaderboardKeysJSON = [];
    const leaderboardKey = `leaderboard:${subName}`;
    const leaderboardKeys = await context.redis.zRange(leaderboardKey, 0, 4, 'WITHSCORES');
    console.log('Raw leaderboardKeys:', leaderboardKeys);
    
    for (let i = 0; i < leaderboardKeys.length; i ++) {
      // Access the member and score
      const member = leaderboardKeys[i].member; 
      const score = leaderboardKeys[i].score; 

      // Split the member into userId and timestamp
      const [userId, timestamp] = member.split(':');
      const user = userId || 'Unknown';

      leaderboardKeysJSON.push({ user, score });
      console.log('leaderboardKeysJSON:', leaderboardKeysJSON);
    }
    leaderboardKeysJSON.sort((a, b) => b.score - a.score);
    return leaderboardKeysJSON;
  });
    
  const leaderboard = fetchLeaderboard || [];

  return (
    <zstack width="100%" height="100%">
      <image
        url={leaderboardimg}
        imageWidth="700px"
        imageHeight="350px"
        resizeMode="fill"
      />
    <vstack
      width="100%"
      height="100%"
      alignment="top center"
      gap="small"
      padding="medium"
      backgroundColor="rgba(44, 44, 44, 0.7)"
      >
      {/* Subreddit Title */}
      <text size="xxlarge" weight="bold" color='white'>{subName ?? 'Unknown'} Leaderboard</text>

      {loading && (
          <vstack alignment="center middle">
            <image url="loading-gif.gif" imageWidth={100} imageHeight={100} />
            <text color="white" size="large">Loading...</text>
          </vstack>
        )}
      {error ? (
        <text color="red">Failed to fetch leaderboard data: {error.message}</text>
      ) : leaderboard.length > 0 ? (
        <vstack gap="small" width="50%" alignment="center">
          {leaderboard.map((entry, index) => (
            <hstack
              key={`${entry.user}-${index}`}
              gap="medium"
              alignment="middle center"
              backgroundColor="white"
              padding="small"
              cornerRadius="medium"
              width="90%"
            >
              <text size="large" weight="bold">{index + 1}.</text>
              <text size="large">{entry.user}</text>
              <spacer />
              <text size="large" color="green">{entry.score} pts</text>
            </hstack>
          ))}
        </vstack>
      ) : (
        <vstack gap="large" alignment="center middle">
        <text size='large' color='white'>No leaderboard data available for {subName ?? 'Unknown'}</text>
        </vstack>
      )}
      <hstack gap="small">
        <button onPress={() => setPage('KarmaQuiz')}>Home</button>
        <button onPress={() => setPage('leaderboardcategory')}>Back</button>
      </hstack>
    </vstack>
    </zstack>
  );
};

const SubredditPage = ({ setPage, context, subName, currentUser }: PageProps) => {
  const category = context.assets.getURL('quixbg.jpeg');
  
  const { data: question, loading, error } = useAsync(async () => {
    const questionKeys = [];
    const questionKeysJSON = [];
    for (let i = 0; i < 21; i++) {
      const redisKey = `quiz:${subName}::${i}`;
      const storedQuestion = await context.redis.get(redisKey);
      questionKeys.push(storedQuestion);
    }
    for (let i = 0; i < 21; i++) {
      if (questionKeys[i] != null) {
        questionKeysJSON.push(JSON.parse(questionKeys[i]));
      }
    }
    return questionKeysJSON;
  });

  // State for managing the current question, score, and incorrect answer
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]); // Track answered questions
  const [score, setScore] = useState(0);
  const [quizOver, setQuizOver] = useState(false); // Track if the quiz is over
  const [incorrectAnswer, setIncorrectAnswer] = useState(false); // Track if an incorrect answer is selected
  const [timeLeft, setTimeLeft] = useState(10); // 10 seconds timer
  const [isTimerActive, setIsTimerActive] = useState(false);

  const userId = currentUser; // Assuming user ID is available from context

  // Function to handle option clicks
  const handleOptionClick = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(score + 1);

      if (currentQuestionIndex !== null) {
        setAnsweredQuestions([...answeredQuestions, currentQuestionIndex]);
      }

      const remainingQuestions = question?.filter(
        (_, index) =>
          !answeredQuestions.includes(index) && index !== currentQuestionIndex
      ) || [];
      if (remainingQuestions.length > 0) {
        const nextIndex = Math.floor(Math.random() * remainingQuestions.length);
        if (question) {
          setCurrentQuestionIndex(question.indexOf(remainingQuestions[nextIndex]));
        }
      } else {
        console.log('Current score:', score);
        console.log('User ID:', userId);
        console.log('Calling updateLeaderboard...');
        updateLeaderboard(); // Added: Call function when quiz is over
        setQuizOver(true);
      }
        
    } else {
      setIncorrectAnswer(true);
    }
  };

  const updateLeaderboard = async () => {
    try {
      const userStatsKey = `user:${userId}:stats`;
      const leaderboardKey = `leaderboard:${subName}`; // Global leaderboard for the category
      const userScore = score; // Current score from the quiz
      const timestamp = Date.now(); // Timestamp of when the score was achieved
  
      console.log(`Attempting to update leaderboard for category: ${subName}`);
      console.log(`User ID: ${userId}, Score: ${userScore}, Timestamp: ${timestamp}`);

      // Retrieve the top 5 users with their scores in ascending order
      const leaderboard = await context.redis.zRange(leaderboardKey, 0, -1, 'WITHSCORES');
      console.log(`Retrieved leaderboard: ${JSON.stringify(leaderboard)}`);

      const lowestScoreMember = leaderboard[0];

      // Check if the leaderboard has less than 5 entries or if the current score is higher than the lowest score
      if (leaderboard.length < 5){
        const addResult = await context.redis.zAdd(leaderboardKey, {
          score: userScore,
          member: `${userId}:${timestamp}`,
        });
        console.log(`Added user ${userId}:${timestamp} with score ${userScore} to the leaderboard.`);
        
      } else if( userScore > lowestScoreMember.score) {
        // Add or update the score in the leaderboard
        console.log(`Lowsest score member: ${lowestScoreMember.score}`);
        await context.redis.zRemRangeByRank(leaderboardKey, 0,0);
        console.log(`Removed member ${lowestScoreMember.score} from the leaderboard.`);

        const addResult = await context.redis.zAdd(leaderboardKey, {
          score: userScore,
          member: `${userId}:${timestamp}`,
        });
        console.log(`Added user ${userId}:${timestamp} with score ${userScore} to the leaderboard.`);
        
        // Retrieve the top 5 again after adding the new score
        const updatedLeaderboard = await context.redis.zRange(leaderboardKey, 0, -1, 'WITHSCORES');
        console.log(`Final updated leaderboard: ${JSON.stringify(updatedLeaderboard)}`);
  
        console.log('Leaderboard updated successfully');
      } else {
        console.log('Score is not high enough to be added to the leaderboard.');
      }
    } catch (error) {
      console.error('Failed to update leaderboard:', error);
    }
  };
  // Start quiz after all questions are loaded
  const startQuiz = () => {
    if (question?.length) {
      const firstIndex = Math.floor(Math.random() * question.length);
      setCurrentQuestionIndex(firstIndex);
      setIncorrectAnswer(false);
    }
  };

  // Function to return to homepage
  const goToHomePage = () => {
    setPage('KarmaQuiz');
    setCurrentQuestionIndex(null);
    setAnsweredQuestions([]);
    setScore(0);
    setIncorrectAnswer(false);
    setQuizOver(false);
  };

  return (
    <zstack width="100%" height="100%">
      <image
        url={category}
        imageWidth="700px"
        imageHeight="350px"
        resizeMode="fill"
      />
      <vstack
        width="100%"
        height="100%"
        alignment="middle center"
        gap="small"
        backgroundColor="rgba(44, 44, 44, 0.7)"
      >
        {loading && (
          <vstack alignment="center middle">
            <image url="loading-gif.gif" imageWidth={100} imageHeight={100} />
            <text color="white" size="large">Loading...</text>
          </vstack>
        )}
        {error && <text color="red">Failed to fetch the quiz questions</text>}
        {!loading && !error && question && question.length > 0 ? (
          incorrectAnswer ? (
            <><zstack alignment="center middle" width="100%" height="350px">
            <image url="confetti.gif" imageWidth="700px" imageHeight="350px" resizeMode="cover" />
            <vstack alignment="center middle" gap="medium">
              <text size="xlarge" weight="bold" color="red">Incorrect answer!</text>
              <text size="xxlarge" weight="bold" color="white">Your scored: {score} points</text>
            <button onPress={() => { updateLeaderboard(); goToHomePage(); }}>Back to Homepage</button>
            </vstack>
          </zstack>

            </>
          ) : quizOver ? (
            <>
              <text>Quiz Complete! Your final score: {score}/{question.length}</text>
              
              <button onPress={() => { updateLeaderboard(); goToHomePage(); }}>Back to Homepage</button>
            </>
          ) : currentQuestionIndex === null ? (
            <button onPress={startQuiz}>Start Quiz</button>
          ) : (
            <>
              <text size="xxlarge" color="white" weight="bold" alignment="center" wrap>
                {question[currentQuestionIndex].text}
              </text>
                    <vstack gap="small">
                      {question[currentQuestionIndex].options
                       .sort(() => Math.random() - 0.5) // Shuffle options
                       .map((option: string) => (
                     <button
                      key={option} // Use the option value itself as the key
                      onPress={() =>
                      handleOptionClick(option === question[currentQuestionIndex].correctAnswer) // Compare correctly
                      }
                     >
                     {option}
                      </button>
                   ))}
                      </vstack>

            </>
          )
        ) : (
          !loading && <text>No questions available</text>
        )}
      </vstack>
    </zstack>
  );
};

Devvit.addCustomPostType({
  name: 'Karma Quiz',
  render: (context) => {
    const [page, setPage] = useState('KarmaQuiz');
    const [subName, setSubName] = useState('');

    const { data: currentUser } = useAsync(async () => {
      const user = await context.reddit.getCurrentUser();
      return user?.username ?? 'anonymous';
    });
   

    const handleSetPage = (page: string, subName?: string) => {
      setPage(page);
      if (subName) {
        setSubName(subName);
      }
    };

    let currentPage;
    switch (page) {
      case 'KarmaQuiz':
        currentPage = <HomePage setPage={handleSetPage} currentUser={currentUser} context={context} />;
        break;
      case 'leaderboard':
        currentPage = <Leaderboard setPage={handleSetPage} currentUser={currentUser} context={context} subName={subName}/>;
        break;
      case 'category':
        currentPage = <CategoryPage setPage={handleSetPage} currentUser={currentUser} context={context} />;
        break;
      case 'leaderboardcategory':
        currentPage = <LeaderboardCategoryPage setPage={handleSetPage} currentUser={currentUser} context={context} />;
        break;
      case 'subreddit':
        currentPage = <SubredditPage setPage={handleSetPage} currentUser={currentUser} context={context} subName={subName} />;
        break;
      default:
        currentPage = <HomePage setPage={handleSetPage} currentUser={currentUser} context={context} />;
    }

    return <blocks>{currentPage}</blocks>;
  },
});

export default Devvit;



