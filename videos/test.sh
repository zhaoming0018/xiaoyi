list="amazing comeon eve LeeKaifu show traffic welcome Xiaoyi rap yueyu01 yueyu02"
for i in $list;
do
ffmpeg -i $i.mp4 -c:v libx264 -hls_time 10 -hls_list_size 0 -c:a aac -strict -2 -f hls $i.m3u8 ;
# ffmpeg -re -i $i.mp4 -codec copy -map 0 -f segment -segment_list playlist.m3u8 \
# -segment_list_flags +live -segment_time 3 $i%d.ts
done