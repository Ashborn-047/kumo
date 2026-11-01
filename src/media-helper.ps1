try {
    [System.Reflection.Assembly]::LoadWithPartialName("System.Runtime.WindowsRuntime") | Out-Null
    $asTaskGeneric = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' } | Select-Object -First 1

    $asyncOp = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager, Windows.Media.Control, ContentType = WindowsRuntime]::RequestAsync()
    $asTask = $asTaskGeneric.MakeGenericMethod([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager])
    $task = $asTask.Invoke($null, @($asyncOp))
    $task.Wait(400) | Out-Null
    $manager = $task.Result
    $session = $manager.GetCurrentSession()
    if ($session) {
        $propOp = $session.TryGetMediaPropertiesAsync()
        $asTaskProps = $asTaskGeneric.MakeGenericMethod([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionMediaProperties])
        $propTask = $asTaskProps.Invoke($null, @($propOp))
        $propTask.Wait(400) | Out-Null
        $props = $propTask.Result
        $info = $session.GetPlaybackInfo()
        $timeline = $session.GetTimelineProperties()
        $pos = if ($timeline) { [math]::Round($timeline.Position.TotalSeconds) } else { 0 }
        $dur = if ($timeline) { [math]::Round($timeline.EndTime.TotalSeconds) } else { 0 }
        
        $src = "$($session.SourceAppId)"
        $sourceName = "System Media"
        if ($src -match "Spotify") { $sourceName = "Spotify" }
        elseif ($src -match "Prime" -or $props.Title -match "Prime Video") { $sourceName = "Prime Video" }
        elseif ($src -match "Netflix" -or $props.Title -match "Netflix") { $sourceName = "Netflix" }
        elseif ($src -match "YouTube" -or $props.Artist -match "YouTube") { $sourceName = "YouTube" }
        elseif ($src -match "vlc") { $sourceName = "VLC" }
        elseif ($src -match "chrome") { $sourceName = "Chrome Stream" }
        elseif ($src -match "msedge") { $sourceName = "Edge Stream" }
        else {
            $sp = Get-Process -Name Spotify -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($sp) { $sourceName = "Spotify" }
        }

        $mediaType = "music"
        if ($sourceName -in @("Prime Video", "Netflix", "VLC") -or $dur -gt 600 -or $props.Title -match "Episode|Season|Movie|Film|S\d+E\d+|Trailer") {
            $mediaType = "movie"
        } elseif ($sourceName -eq "YouTube" -or $props.Title -match "Official Video|Live Stream") {
            $mediaType = "video"
        }

        [PSCustomObject]@{
            isPlaying = ($info.PlaybackStatus.ToString() -eq 'Playing')
            status = $info.PlaybackStatus.ToString()
            title = $props.Title
            artist = $props.Artist
            source = $sourceName
            mediaType = $mediaType
            position = $pos
            duration = $dur
        } | ConvertTo-Json -Compress
        exit
    }
} catch {}

$sp = Get-Process -Name Spotify -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -ne '' } | Select-Object -First 1
if ($sp -and $sp.MainWindowTitle -and $sp.MainWindowTitle -ne 'Spotify' -and $sp.MainWindowTitle -notlike 'Spotify *') {
    $parts = $sp.MainWindowTitle -split ' - ', 2
    if ($parts.Count -ge 2) {
        @{ isPlaying = $true; status = 'Playing'; artist = $parts[0].Trim(); title = $parts[1].Trim(); source = 'Spotify'; mediaType = 'music'; position = 0; duration = 0 } | ConvertTo-Json -Compress
    } else {
        @{ isPlaying = $true; status = 'Playing'; artist = 'Spotify'; title = $sp.MainWindowTitle.Trim(); source = 'Spotify'; mediaType = 'music'; position = 0; duration = 0 } | ConvertTo-Json -Compress
    }
} else {
    @{ isPlaying = $false; status = 'Stopped'; artist = 'System Audio'; title = 'Media Controller Idle'; source = 'None'; mediaType = 'music'; position = 0; duration = 0 } | ConvertTo-Json -Compress
}
