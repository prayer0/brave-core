/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "bat/ledger/internal/bat_helper.h"
#include "bat/ledger/internal/ledger_impl.h"
#include "bat/ledger/internal/media/vimeo.h"

using std::placeholders::_1;
using std::placeholders::_2;
using std::placeholders::_3;

namespace braveledger_media {

MediaVimeo::MediaVimeo(bat_ledger::LedgerImpl* ledger):
  ledger_(ledger) {
}

MediaVimeo::~MediaVimeo() {
}

// static
std::string MediaVimeo::GetLinkType(const std::string& url) {
  const std::string api = "https://fresnel.vimeocdn.com/add/player-stats?";
    std::string type;

  if (url.find(api) != std::string::npos) {
    type = VIMEO_MEDIA_TYPE;
  }

  return type;
}

// static
std::string MediaVimeo::GetVideoUrl(const std::string& video_id) {
  if (video_id.empty()) {
    return std::string();
  }

  return "https://vimeo.com/" + video_id;
}

// static
std::string MediaVimeo::GetMediaKey(const std::string& video_id,
                                    const std::string& type) {
  if (video_id.empty()) {
    return std::string();
  }

  if (type == "vimeo-vod") {
    return (std::string)VIMEO_MEDIA_TYPE  + "_" + video_id;
  }

  return std::string();
}

void MediaVimeo::FetchDataFromUrl(
    const std::string& url,
    braveledger_media::FetchDataFromUrlCallback callback) {
  ledger_->LoadURL(url,
                   std::vector<std::string>(),
                   std::string(),
                   std::string(),
                   ledger::URL_METHOD::GET,
                   callback);
}

// static
std::string MediaVimeo::GetPublisherKey(const std::string& key) {
  if (key.empty()) {
    return std::string();
  }

  return (std::string)VIMEO_MEDIA_TYPE + "#channel:" + key;
}

void MediaVimeo::ProcessMedia(const std::map<std::string, std::string>& parts,
                              const ledger::VisitData& visit_data) {

  auto iter = parts.find("video_id");
  std::string video_id;
  if (iter != parts.end()) {
    video_id = iter->second;
  }

  if (video_id.empty()) {
    return;
  }

  std::string type;
  iter = parts.find("type");
  if (iter != parts.end()) {
    type = iter->second;
  }

  const std::string media_key = GetMediaKey(video_id, type);

  ledger::MediaEventInfo event_info;
  iter = parts.find("event");
  if (iter != parts.end()) {
    event_info.event_ = iter->second;
  }

  iter = parts.find("time");
  if (iter != parts.end()) {
    event_info.time_ = iter->second;
  }

  auto callback = std::bind(&MediaVimeo::OnProcessMedia,
                            this,
                            media_key,
                            event_info,
                            _1,
                            _2,
                            _3);

  FetchDataFromUrl(GetVideoUrl(video_id), callback);
}

void MediaVimeo::ProcessActivityFromUrl(uint64_t window_id,
                                        const ledger::VisitData& visit_data) {

}

void MediaVimeo::OnProcessMedia(
    const std::string& media_key,
    ledger::MediaEventInfo event_info,
    int response_status_code,
    const std::string& response,
    const std::map<std::string, std::string>& headers) {
  ledger_->LogResponse(__func__, response_status_code, response, headers);

  // TODO
  // we need to get publisher info from video page
  // publisher key - user ID
  // favicon - https://i.vimeocdn.com/portrait/{userID}_300x300.webp
  // publisher name
  // publisher url - https://vimeo.com/{userName}

}

}  // namespace braveledger_media
