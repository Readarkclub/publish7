import { useState, useEffect, useCallback } from 'react';
import * as eventService from '../services/eventService';
import * as userEventService from '../services/userEventService';

interface UseUserDataResult {
  registeredEvents: string[];
  favoriteEvents: string[];
  publishedEvents: string[];
  draftEvents: string[];
  followedOrganizers: string[];
  
  // Actions
  loadUserData: (email: string) => Promise<void>;
  clearUserData: () => void;
  
  setRegisteredEvents: React.Dispatch<React.SetStateAction<string[]>>;
  setFavoriteEvents: React.Dispatch<React.SetStateAction<string[]>>;
  setPublishedEvents: React.Dispatch<React.SetStateAction<string[]>>;
  setDraftEvents: React.Dispatch<React.SetStateAction<string[]>>;
  setFollowedOrganizers: React.Dispatch<React.SetStateAction<string[]>>;
}

export function useUserData(userEmail?: string): UseUserDataResult {
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<string[]>([]);
  const [publishedEvents, setPublishedEvents] = useState<string[]>([]);
  const [draftEvents, setDraftEvents] = useState<string[]>([]);
  const [followedOrganizers, setFollowedOrganizers] = useState<string[]>([]);

  const loadUserData = useCallback(async (email: string) => {
    console.log('📥 加载用户数据:', email);

    try {
      // 并行加载所有用户数据
      const [
        registeredResult,
        favoriteResult,
        publishedResult,
        draftResult,
        followedResult
      ] = await Promise.all([
        userEventService.getRegisteredEvents(email),
        userEventService.getFavoriteEvents(email),
        eventService.getUserPublishedEvents(email),
        eventService.getUserDraftEvents(email),
        userEventService.getFollowedOrganizers(email)
      ]);

      if (registeredResult.success && registeredResult.eventIds) {
        setRegisteredEvents(registeredResult.eventIds);
      }
      
      if (favoriteResult.success && favoriteResult.eventIds) {
        setFavoriteEvents(favoriteResult.eventIds);
      }

      if (publishedResult.success && publishedResult.events) {
        setPublishedEvents(publishedResult.events.map(e => e.id));
      }

      if (draftResult.success && draftResult.events) {
        setDraftEvents(draftResult.events.map(e => e.id));
      }

      if (followedResult.success && followedResult.organizers) {
        setFollowedOrganizers(followedResult.organizers);
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
    }
  }, []);

  const clearUserData = useCallback(() => {
    setRegisteredEvents([]);
    setFavoriteEvents([]);
    setPublishedEvents([]);
    setDraftEvents([]);
    setFollowedOrganizers([]);
  }, []);

  // 当用户邮箱变化时，自动加载或清空数据
  useEffect(() => {
    if (userEmail) {
      loadUserData(userEmail);
    } else {
      clearUserData();
    }
  }, [userEmail, loadUserData, clearUserData]);

  return {
    registeredEvents,
    favoriteEvents,
    publishedEvents,
    draftEvents,
    followedOrganizers,
    loadUserData,
    clearUserData,
    setRegisteredEvents,
    setFavoriteEvents,
    setPublishedEvents,
    setDraftEvents,
    setFollowedOrganizers,
  };
}