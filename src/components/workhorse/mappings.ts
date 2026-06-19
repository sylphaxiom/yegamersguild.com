import * as React from "react";
import Facebook from "@mui/icons-material/Facebook";
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import XIcon from '@mui/icons-material/X';
import YouTubeIcon from '@mui/icons-material/YouTube';
import TagIcon from '@mui/icons-material/Tag';
import FlagIcon from '@mui/icons-material/Flag';
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import GroupsIcon from '@mui/icons-material/Group';
import CakeIcon from '@mui/icons-material/Cake';
import ShareIcon from '@mui/icons-material/Share';
import CasinoIcon from '@mui/icons-material/Casino';
import HomeIcon from '@mui/icons-material/Home';
import BlockIcon from '@mui/icons-material/Block';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CameraIcon from '@mui/icons-material/Camera';
import CampaignIcon from '@mui/icons-material/Campaign';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import GoogleIcon from '@mui/icons-material/Google';
import IcecreamIcon from '@mui/icons-material/Icecream';
import InfoIcon from '@mui/icons-material/Info';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import MovieIcon from '@mui/icons-material/Movie';
import PetsIcon from '@mui/icons-material/Pets';
import RedditIcon from '@mui/icons-material/Reddit';
import RecyclingIcon from '@mui/icons-material/Recycling';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import SpeakerIcon from '@mui/icons-material/Speaker';
import StorefrontIcon from '@mui/icons-material/Storefront';
import TimeToLeaveIcon from '@mui/icons-material/TimeToLeave';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import MoodBadIcon from '@mui/icons-material/MoodBad';
import AddAlertIcon from '@mui/icons-material/AddAlert';
import BackHandIcon from '@mui/icons-material/BackHand';
import AddIcon from '@mui/icons-material/Add';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

export const iconMap: Record<string, React.ReactElement> = {
    Facebook: React.createElement(Facebook),
    Instagram: React.createElement(InstagramIcon),
    LinkedIn: React.createElement(LinkedInIcon),
    X: React.createElement(XIcon),
    YouTube: React.createElement(YouTubeIcon),
    Google: React.createElement(GoogleIcon),
    Reddit: React.createElement(RedditIcon),
    Hashtag: React.createElement(TagIcon),
    Flag: React.createElement(FlagIcon),
    Sparkles: React.createElement(AutoAwesomeIcon),
    Group: React.createElement(GroupsIcon),
    Cake: React.createElement(CakeIcon),
    Share: React.createElement(ShareIcon),
    Dice: React.createElement(CasinoIcon),
    House: React.createElement(HomeIcon),
    Block: React.createElement(BlockIcon),
    Calendar: React.createElement(CalendarMonthIcon),
    Camera: React.createElement(CameraIcon),
    Announcement: React.createElement(CampaignIcon),
    Download: React.createElement(FileDownloadIcon),
    Dessert: React.createElement(IcecreamIcon),
    Info: React.createElement(InfoIcon),
    Idea: React.createElement(LightbulbIcon),
    Movie: React.createElement(MovieIcon),
    Pets: React.createElement(PetsIcon),
    Recycling: React.createElement(RecyclingIcon),
    Rocket: React.createElement(RocketLaunchIcon),
    Rss: React.createElement(RssFeedIcon),
    Speaker: React.createElement(SpeakerIcon),
    Store: React.createElement(StorefrontIcon),
    Car: React.createElement(TimeToLeaveIcon),
    Warning: React.createElement(WarningAmberIcon),
    Event: React.createElement(EmojiEventsIcon),
    Happy: React.createElement(SentimentVerySatisfiedIcon),
    Satisfied: React.createElement(SentimentSatisfiedAltIcon),
    Neutral: React.createElement(SentimentNeutralIcon),
    Unhappy: React.createElement(SentimentVeryDissatisfiedIcon),
    Bad: React.createElement(MoodBadIcon),
    Alert: React.createElement(AddAlertIcon),
    Hand: React.createElement(BackHandIcon),
    Add: React.createElement(AddIcon),
    Admin: React.createElement(AdminPanelSettingsIcon)
};