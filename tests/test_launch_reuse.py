"""Regression tests for safe canonical-server reuse."""

from __future__ import annotations

import signal
import unittest
from unittest import mock

import launch


class _Child:
    def poll(self):
        return None


class LaunchReuseTests(unittest.TestCase):
    @mock.patch.object(launch.subprocess, "Popen")
    @mock.patch.object(launch, "our_server_is_up", return_value=True)
    def test_current_server_is_reused(self, _server_up, popen):
        launch.launch(no_open=True)
        popen.assert_not_called()

    @mock.patch.object(launch.time, "sleep")
    @mock.patch.object(launch.subprocess, "Popen", return_value=_Child())
    @mock.patch.object(launch, "listeners", return_value=[])
    @mock.patch.object(launch, "our_server_is_up", side_effect=[False, True])
    def test_missing_server_is_started(self, server_up, _listeners, popen, _sleep):
        launch.launch(no_open=True)
        popen.assert_called_once()
        self.assertEqual(server_up.call_count, 2)

    @mock.patch.object(launch.os, "kill")
    @mock.patch.object(launch, "server_process_is_ours", return_value=False)
    @mock.patch.object(launch, "our_server_is_up", return_value=True)
    @mock.patch.object(launch, "listeners", return_value=[4321])
    def test_unverified_listener_is_never_killed(
        self, _listeners, _server_up, _is_ours, kill
    ):
        with self.assertRaisesRegex(RuntimeError, "left alone"):
            launch.stop_verified_server()
        kill.assert_not_called()

    @mock.patch.object(launch.time, "sleep")
    @mock.patch.object(launch.os, "kill")
    @mock.patch.object(launch, "server_process_is_ours", return_value=True)
    @mock.patch.object(launch, "our_server_is_up", return_value=True)
    @mock.patch.object(launch, "listeners", side_effect=[[2468], []])
    def test_only_verified_listener_receives_sigterm(
        self, _listeners, _server_up, _is_ours, kill, _sleep
    ):
        launch.stop_verified_server()
        kill.assert_called_once_with(2468, signal.SIGTERM)


if __name__ == "__main__":
    unittest.main()
