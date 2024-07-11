dlbio-commsqa-tests-millicast-sdk
==========================================

Dolby.io tests for Millicast SDK

Dolby.io test framework structure
=================================

Dolby.io test framework is split to multi-level structure to give
a flexibility to the development environment and minimize the number
of dependencies basing on the test scope. 

* dlbio-commsqa-core
* dlbio-commsqa-pytest-plugin
* dlbio-commsqa-tests-base - One test base package to rule them all :)
* dlbio-commsqa-tests-<TEST_SUITE_NAME>

.. note::
 
    - This package is a namespace package, do not create __init__.py file in its root dir 
    - There must be only one instance of pytest.ini located in the base package
      and all other tests packages must not contain a pytest.ini file.
    - At the root of the dlbio_commsqa_tests namespace there must be only one conftest.py file,
      the one located in the base package.
      All other test packages must not contain a conftest.py in their root dir,
      but they can have them located in sudirectories.

How to run tests
==================
See `dlbio-commsqa-tests-template <https://gitlab-sfo.dolby.net/voxeet/cloudqa/dlbio-commsqa-tests-template>`_
