// ============================================================
// ui/board/js/pin-listener.js — Island & Popout Card Pinning Integration
// ============================================================

import { state } from './state.js';
import { renderCards } from './card-renderer.js';
import { saveState, toast } from './storage.js';
import { updateMiniMap } from './minimap.js';

export function setupPinListener() {
  if (!window.goo?.onCardPinned) return;

  window.goo.onCardPinned((cardData) => {
    if (!cardData) return;

    const isMedia = cardData.type === 'media' || Boolean(cardData.data?.track);

    // If a song is pinned: Route strictly into the SINGLE dedicated Pinned Songs / Media Hub card!
    if (isMedia) {
      const trackTitle = cardData.data?.track || cardData.title || 'Live Media';
      const artistName = cardData.data?.artist || 'Unknown';
      const sourceName = cardData.data?.source || 'System Media';
      const mediaType = cardData.data?.mediaType || (cardData.data?.duration > 600 ? 'movie' : 'music');
      const pos = cardData.data?.position || 0;
      const dur = cardData.data?.duration || 0;
      const stoppedAt = cardData.data?.stoppedAt || (pos > 0 ? `${Math.floor(pos / 60)}:${String(pos % 60).padStart(2, '0')}` : '0:00');
      const progress = cardData.data?.progress ?? (dur > 0 ? Math.min(100, Math.round((pos / dur) * 100)) : 0);

      const mediaEntry = {
        id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        track: trackTitle,
        artist: artistName,
        source: sourceName,
        mediaType,
        position: pos,
        duration: dur,
        stoppedAt,
        progress,
        status: cardData.data?.status || 'Paused',
        pinnedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      let mediaCard = state.cards.find((c) => c.type === 'media');
      if (mediaCard) {
        if (!Array.isArray(mediaCard.data.pinnedMedia)) {
          mediaCard.data.pinnedMedia = Array.isArray(mediaCard.data.pinnedSongs) ? mediaCard.data.pinnedSongs : [];
        }
        const existingIdx = mediaCard.data.pinnedMedia.findIndex(
          (s) => s.track.toLowerCase() === trackTitle.toLowerCase()
        );
        if (existingIdx !== -1) {
          mediaCard.data.pinnedMedia.splice(existingIdx, 1);
        }
        mediaCard.data.pinnedMedia.unshift(mediaEntry);
        mediaCard.data.pinnedSongs = mediaCard.data.pinnedMedia;
        mediaCard.data.track = trackTitle;
        mediaCard.data.artist = artistName;
        mediaCard.data.source = sourceName;
        mediaCard.data.mediaType = mediaType;
        mediaCard.data.position = pos;
        mediaCard.data.duration = dur;
        mediaCard.data.stoppedAt = stoppedAt;
        mediaCard.data.progress = progress;
        mediaCard.data.isPlaying = Boolean(cardData.data?.isPlaying);
        mediaCard.zIndex = ++state.nextZIndex;
        toast(`Pinned "${trackTitle}" (${stoppedAt}) to Media & Watchlist!`);
      } else {
        const offset = (state.cards.length % 5) * 40;
        mediaCard = {
          id: 'card-media-hub',
          type: 'media',
          title: 'Media & Watchlist Deck',
          x: Math.max(60, 200 + offset),
          y: Math.max(80, 160 + offset),
          width: 600,
          data: {
            track: trackTitle,
            artist: artistName,
            source: sourceName,
            mediaType,
            position: pos,
            duration: dur,
            stoppedAt,
            progress,
            isPlaying: Boolean(cardData.data?.isPlaying),
            pinnedMedia: [mediaEntry],
            pinnedSongs: [mediaEntry],
          },
          zIndex: ++state.nextZIndex,
        };
        state.cards.push(mediaCard);
        toast(`Pinned "${trackTitle}" (${stoppedAt}) to Media & Watchlist!`);
      }
      saveState();
      renderCards();
      updateMiniMap();
      return;
    }

    // If an item is pinned from Edge Drop: Route strictly into the dedicated Edge Drop & Web Stash deck!
    const isDrop = cardData.type === 'drop' || cardData.type === 'link' || cardData.id?.startsWith('card-drop-') || Boolean(cardData.data?.url);
    if (isDrop) {
      const itemTitle = cardData.title || cardData.data?.text || 'Pinned Item';
      const itemUrl = cardData.data?.url || (cardData.type === 'link' ? cardData.data?.text : '');
      const itemType = cardData.data?.itemType || (itemUrl || cardData.type === 'link' ? 'link' : (cardData.data?.path ? 'file' : 'snippet'));
      const itemBadge = cardData.data?.badge || (itemType === 'link' ? 'URL' : itemType.toUpperCase());

      const dropEntry = {
        id: `drop-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: itemTitle,
        url: itemUrl,
        text: cardData.data?.text || cardData.title || '',
        itemType,
        badge: itemBadge,
        color: cardData.data?.color || 'lilac',
        pinnedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      let dropCard = state.cards.find((c) => c.type === 'drop');
      if (dropCard) {
        if (!Array.isArray(dropCard.data.items)) dropCard.data.items = [];
        const existingIdx = dropCard.data.items.findIndex(
          (i) => (i.url && i.url === itemUrl) || (i.title && i.title === itemTitle)
        );
        if (existingIdx !== -1) {
          dropCard.data.items.splice(existingIdx, 1);
        }
        dropCard.data.items.unshift(dropEntry);
        dropCard.zIndex = ++state.nextZIndex;
        toast(`Pinned "${itemTitle}" to Edge Drop & Web Stash!`);
      } else {
        const offset = (state.cards.length % 5) * 40;
        dropCard = {
          id: 'card-drop-hub',
          type: 'drop',
          title: 'Edge Drop & Web Stash',
          x: Math.max(60, 200 + offset),
          y: Math.max(80, 160 + offset),
          width: 580,
          data: {
            items: [dropEntry],
            activeSubFilter: 'all',
            searchQuery: '',
          },
          zIndex: ++state.nextZIndex,
        };
        state.cards.push(dropCard);
        toast(`Pinned "${itemTitle}" to Edge Drop & Web Stash!`);
      }
      saveState();
      renderCards();
      updateMiniMap();
      return;
    }

    // Non-media card pinning (notes, custom cards, etc.)
    const existing = state.cards.find((c) => c.id === cardData.id);
    if (existing) {
      existing.data = { ...existing.data, ...(cardData.data || {}) };
      toast(`Updated "${cardData.title || existing.title}" on canvas`);
    } else {
      const offset = (state.cards.length % 5) * 40;
      const isNote = cardData.type === 'notes';
      const type = isNote ? 'notes' : (cardData.type || 'notes');

      let cardDataPayload = cardData.data || {};
      if (isNote) {
        cardDataPayload = {
          bgColor: cardData.data?.color === 'lilac' ? '#eadfff' : (cardData.data?.color === 'sky' ? '#dcedff' : '#fff5c8'),
          colorName: cardData.data?.color || 'Lilac',
          items: [
            { id: `t-${Date.now()}`, text: cardData.data?.text || cardData.text || cardData.title || 'Note', done: false, tag: 'PINNED' }
          ],
          scratchText: '',
        };
      } else if (cardData.text) {
        cardDataPayload = { text: cardData.text };
      }

      const newCard = {
        id: cardData.id || `card-${type}-${Date.now()}`,
        type,
        title: cardData.title || 'Pinned Note',
        x: Math.max(60, 200 + offset),
        y: Math.max(80, 160 + offset),
        width: cardData.width || 340,
        data: cardDataPayload,
        zIndex: (state.cards.length || 0) + 1,
      };
      state.cards.push(newCard);
      toast(`Pinned "${newCard.title}" to canvas!`);
    }
    saveState();
    renderCards();
    updateMiniMap();
  });
}

import { initResidentCompanion } from './resident-companion.js';

export function setupCompanionSpatialMigration(deps = {}) {
  return initResidentCompanion(deps);
}

