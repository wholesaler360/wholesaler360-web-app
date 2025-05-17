import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Quote,
  BarChart3,
  Package,
  Users,
  Loader2,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Business quotes for random display
const BUSINESS_QUOTES = [
  {
    text: "Quality in a service or product is not what you put into it. It's what the customer gets out of it.",
    author: "Peter Drucker",
  },
  {
    text: "The best way to predict the future is to create it.",
    author: "Peter Drucker",
  },
  {
    text: "Price is what you pay. Value is what you get.",
    author: "Warren Buffett",
  },
  {
    text: "Your most unhappy customers are your greatest source of learning.",
    author: "Bill Gates",
  },
  {
    text: "A business that makes nothing but money is a poor business.",
    author: "Henry Ford",
  },
  {
    text: "The purpose of business is to create and keep a customer.",
    author: "Peter Drucker",
  },
  {
    text: "Statistics suggest that when customers complain, business owners and managers ought to get excited about it.",
    author: "Zig Ziglar",
  },
  {
    text: "The secret of change is to focus all your energy not on fighting the old, but on building the new.",
    author: "Socrates",
  },
  {
    text: "Success is not the key to happiness. Happiness is the key to success. If you love what you are doing, you will be successful.",
    author: "Albert Schweitzer",
  },
  {
    text: "In the world of business, the people who are most successful are those who are doing what they love.",
    author: "Warren Buffett",
  },
];

const FEATURES = [
  {
    icon: <Package className="h-8 w-8 text-primary" />,
    title: "Inventory Management",
    description:
      "Track stock levels, manage SKUs, and streamline your inventory processes efficiently.",
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Customer Relationship",
    description:
      "Manage customer data, track interactions, and build stronger business relationships.",
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-primary" />,
    title: "Sales Analytics",
    description:
      "Gain insights into sales trends, performance metrics, and make data-driven decisions.",
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    title: "Order Processing",
    description:
      "Simplify order creation, tracking, and fulfillment for seamless operations.",
  },
];

function HomeComponent() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Timer to update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 2000);

    // Select random quote
    const randomQuote =
      BUSINESS_QUOTES[Math.floor(Math.random() * BUSINESS_QUOTES.length)];

    // Simulate loading
    setTimeout(() => {
      setQuote(randomQuote);
      setLoading(false);
    }, 0);

    return () => clearInterval(timer);
  }, []);

  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = currentTime.toLocaleDateString("en-US", dateOptions);
  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Framer motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const quoteVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
        delay: 0.2,
      },
    },
  };

  const cardHoverVariants = {
    hover: {
      y: -10,
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
  };

  return (
    <motion.div
      className="flex flex-1 flex-col gap-8 p-6 bg-white dark:bg-black"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header section with date and time */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row md:justify-between md:items-center"
      >
        <div>
          <motion.h1
            className="text-4xl font-bold tracking-tight"
            animate={{ opacity: [0, 1], y: [20, 0] }}
            transition={{ duration: 0.5 }}
          >
            Welcome to Wholesaler360
          </motion.h1>
          <motion.div
            className="flex items-center mt-2 space-x-2"
            animate={{ opacity: [0, 1], x: [-20, 0] }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Calendar className="h-5 w-5 text-primary" />
            <p className="text-lg text-muted-foreground">{formattedDate}</p>
          </motion.div>
        </div>

        <motion.div
          className="flex items-center mt-2 md:mt-0 space-x-2 bg-black/5 dark:bg-white/5 p-2 px-4 rounded-full"
          animate={{ opacity: [0, 1], x: [20, 0] }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Clock className="h-5 w-5 text-primary" />
          <p className="text-lg font-mono">{formattedTime}</p>
        </motion.div>
      </motion.div>

      {/* Quote of the day card with animation */}
      <motion.div
        variants={quoteVariants}
        whileHover={{ scale: 1.008 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-2 border-black/10 dark:border-white/10 overflow-hidden relative">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Quote className="h-5 w-5 text-primary" />
              <CardTitle>Quote of the Day</CardTitle>
            </div>
            <Separator className="my-2" />
          </CardHeader>
          <CardContent className="relative">
            {loading ? (
              <div className="space-y-3 py-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 ml-auto mt-2 animate-pulse"></div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-xl italic font-serif">"{quote?.text}"</p>
                <p className="text-right mt-2 text-sm text-muted-foreground">
                  — {quote?.author}
                </p>
              </motion.div>
            )}
            <motion.div
              className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full z-0"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Features Section */}
      <motion.div variants={itemVariants}>
        <h2 className="text-3xl font-semibold tracking-tight mb-6 text-center md:text-left">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, index) => (
            <motion.div key={index} variants={itemVariants} whileHover="hover">
              <Card className="h-full flex flex-col border-2 border-black/10 dark:border-white/10 hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center space-x-3 pb-3">
                  {feature.icon}
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
                
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Footer animation */}
      <motion.div
        className="mt-auto text-center text-xs text-muted-foreground p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <p>Wholesaler360 — Empowering Your Business</p>
      </motion.div>
    </motion.div>
  );
}

export default HomeComponent;
